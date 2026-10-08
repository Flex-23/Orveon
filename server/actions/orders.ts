"use server";

// إجراء تنفيذ الشراء: إنشاء طلب + عناصره + خصم الكميات + تفريغ السلة.
import { redirect } from "next/navigation";
import { revalidatePath, revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { checkoutSchema } from "@/lib/validations/checkout";
import { processOnlinePayment } from "@/lib/payment";
import { effectiveStatus } from "@/lib/product-status";
import { fieldErrorsFromZod } from "@/lib/form";
import type { Order } from "@/lib/generated/prisma";

export type CheckoutState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

export async function placeOrderAction(
  _prev: CheckoutState,
  formData: FormData,
): Promise<CheckoutState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/checkout");

  const parsed = checkoutSchema.safeParse({
    paymentMethod: formData.get("paymentMethod"),
    deliveryName: formData.get("deliveryName") || undefined,
    deliveryPhone: formData.get("deliveryPhone") || undefined,
    governorate: formData.get("governorate") || undefined,
    address: formData.get("address") || undefined,
    nearestLandmark: formData.get("nearestLandmark") || undefined,
  });

  if (!parsed.success) {
    return { fieldErrors: fieldErrorsFromZod(parsed.error) };
  }

  const data = parsed.data;

  const cart = await prisma.cart.findUnique({
    where: { userId: user.id },
    include: { items: { include: { product: true } } },
  });

  if (!cart || cart.items.length === 0) {
    return { error: "سلتك فارغة." };
  }

  // التحقق من توفّر الكميات
  for (const item of cart.items) {
    if (effectiveStatus(item.product) !== "available") {
      return { error: `المنتج «${item.product.name}» لم يعد متوفّراً. عدّل سلتك.` };
    }
    if (item.quantity > item.product.quantity) {
      return {
        error: `الكمية المطلوبة من «${item.product.name}» تتجاوز المتوفّر (${item.product.quantity}).`,
      };
    }
  }

  const total = cart.items.reduce(
    (sum, i) => sum + Number(i.product.price) * i.quantity,
    0,
  );

  // الدفع
  let paymentStatus: "pending" | "paid" = "pending";
  if (data.paymentMethod === "online") {
    const result = await processOnlinePayment({
      amount: total,
      orderRef: `user-${user.id}-${Date.now()}`,
    });
    paymentStatus = result.status === "paid" ? "paid" : "pending";
  }

  // إنشاء الطلب + خصم الكميات + تفريغ السلة ضمن معاملة واحدة.
  // الخصم ذرّي ومشروط (quantity >= المطلوب) لمنع البيع الزائد عند الطلبات المتزامنة.
  let order: Order;
  try {
    order = await prisma.$transaction(async (tx) => {
      // 1) خصم ذرّي مشروط لكل عنصر — تُنفّذه قاعدة البيانات على القيمة الحالية،
      //    ويفشل (count === 0) إن نفدت الكمية بين الفحص والكتابة بفعل طلب متزامن.
      for (const item of cart.items) {
        const res = await tx.product.updateMany({
          where: { id: item.productId, quantity: { gte: item.quantity } },
          data: { quantity: { decrement: item.quantity } },
        });
        if (res.count === 0) {
          throw new Error(
            `الكمية المطلوبة من «${item.product.name}» لم تعد متوفّرة. عدّل سلتك.`,
          );
        }
      }

      // 2) تعليم المنتجات التي وصلت إلى صفر بأنها "نافذة"
      await tx.product.updateMany({
        where: {
          id: { in: cart.items.map((i) => i.productId) },
          quantity: { lte: 0 },
          status: "available",
        },
        data: { status: "out_of_stock" },
      });

      // 3) إنشاء الطلب وعناصره (بعد ضمان توفّر المخزون)
      const created = await tx.order.create({
        data: {
          userId: user.id,
          total,
          paymentMethod: data.paymentMethod,
          paymentStatus,
          orderStatus: "pending",
          deliveryName: data.deliveryName ?? null,
          deliveryPhone: data.deliveryPhone ?? null,
          governorate: data.governorate ?? null,
          address: data.address ?? null,
          nearestLandmark: data.nearestLandmark ?? null,
          items: {
            create: cart.items.map((i) => ({
              productId: i.productId,
              quantity: i.quantity,
              unitPrice: i.product.price,
            })),
          },
        },
      });

      // 4) تفريغ السلة
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      return created;
    });
  } catch (e) {
    // فشل الخصم الذرّي يُرجِع كل المعاملة (لا طلب ولا خصم جزئي).
    return {
      error: e instanceof Error ? e.message : "تعذّر إتمام الطلب. حاول مجدداً.",
    };
  }

  // الخصم من المخزون يغيّر حالة "نافذ" على كروت المتجر المُخزَّنة
  revalidateTag("products", "max");
  revalidatePath("/store");
  revalidatePath("/cart");
  redirect(`/orders/${order.id}?success=1`);
}
