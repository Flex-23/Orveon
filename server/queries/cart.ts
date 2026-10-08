// استعلامات السلة.
import { prisma } from "@/lib/prisma";

/** جلب سلة المستخدم مع عناصرها وتفاصيل المنتجات. */
export async function getCartWithItems(userId: number) {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        orderBy: { createdAt: "asc" },
        include: { product: { include: { category: true } } },
      },
    },
  });
  return cart;
}

/** عدد القطع في السلة (لمؤشّر بسيط). */
export async function getCartCount(userId: number): Promise<number> {
  const items = await prisma.cartItem.findMany({
    where: { cart: { userId } },
    select: { quantity: true },
  });
  return items.reduce((sum, i) => sum + i.quantity, 0);
}
