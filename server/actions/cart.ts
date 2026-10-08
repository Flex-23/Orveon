"use server";

// إجراءات السلة. الإضافة للسلة تتطلب تسجيل الدخول أولاً.
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { effectiveStatus } from "@/lib/product-status";
import { getId } from "@/lib/form";

export async function addToCartAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/store");

  const productId = getId(formData, "productId");
  if (productId === null) return;

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return;

  // لا تُضاف إلا المنتجات المتوفّرة فعلياً
  if (effectiveStatus(product) !== "available") return;

  const cart = await prisma.cart.upsert({
    where: { userId: user.id },
    update: {},
    create: { userId: user.id },
  });

  await prisma.cartItem.upsert({
    where: { cartId_productId: { cartId: cart.id, productId } },
    update: { quantity: { increment: 1 } },
    create: { cartId: cart.id, productId, quantity: 1 },
  });

  revalidatePath("/store");
  revalidatePath("/cart");
}

/** زيادة كمية عنصر في السلة بمقدار 1. */
export async function incrementCartItem(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/cart");
  const productId = getId(formData, "productId");
  if (productId === null) return;

  await prisma.cartItem.updateMany({
    where: { productId, cart: { userId: user.id } },
    data: { quantity: { increment: 1 } },
  });
  revalidatePath("/cart");
}

/** إنقاص كمية عنصر بمقدار 1 (يُحذف إذا وصل إلى صفر). */
export async function decrementCartItem(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/cart");
  const productId = getId(formData, "productId");
  if (productId === null) return;

  const item = await prisma.cartItem.findFirst({
    where: { productId, cart: { userId: user.id } },
  });
  if (!item) return;

  if (item.quantity <= 1) {
    await prisma.cartItem.delete({ where: { id: item.id } });
  } else {
    await prisma.cartItem.update({
      where: { id: item.id },
      data: { quantity: { decrement: 1 } },
    });
  }
  revalidatePath("/cart");
}

/** حذف عنصر من السلة. */
export async function removeCartItem(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/cart");
  const productId = getId(formData, "productId");
  if (productId === null) return;

  await prisma.cartItem.deleteMany({
    where: { productId, cart: { userId: user.id } },
  });
  revalidatePath("/cart");
}
