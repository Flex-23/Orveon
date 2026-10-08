"use server";

// إجراء حجز منتج بحالة "قريباً". يتطلب تسجيل الدخول.
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { reservationSchema } from "@/lib/validations/reservation";
import { fieldErrorsFromZod } from "@/lib/form";

export type ReserveState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

export async function reserveAction(
  _prev: ReserveState,
  formData: FormData,
): Promise<ReserveState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/store");

  const parsed = reservationSchema.safeParse({
    productId: formData.get("productId"),
    name: formData.get("name"),
    phone: formData.get("phone"),
    governorate: formData.get("governorate") || undefined,
    nearestLandmark: formData.get("nearestLandmark") || undefined,
    quantity: formData.get("quantity"),
    note: formData.get("note") || undefined,
  });

  if (!parsed.success) {
    return { fieldErrors: fieldErrorsFromZod(parsed.error) };
  }

  const data = parsed.data;

  const product = await prisma.product.findUnique({ where: { id: data.productId } });
  if (!product || product.status !== "coming_soon") {
    return { error: "هذا المنتج غير متاح للحجز." };
  }

  // منع تكرار حجز قيد الانتظار لنفس المنتج من نفس المستخدم
  const existing = await prisma.reservation.findFirst({
    where: { userId: user.id, productId: data.productId, status: "pending" },
  });
  if (existing) redirect("/store?reserved=exists");

  await prisma.reservation.create({
    data: {
      userId: user.id,
      name: data.name,
      phone: data.phone,
      governorate: data.governorate ?? null,
      nearestLandmark: data.nearestLandmark ?? null,
      quantity: data.quantity,
      productId: data.productId,
      price: product.price,
      status: "pending",
      details: data.note ?? null,
    },
  });

  redirect("/store?reserved=success");
}
