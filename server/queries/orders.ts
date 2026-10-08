// استعلامات الطلبات (لجهة الزبون).
import { prisma } from "@/lib/prisma";

export function getUserOrders(userId: number) {
  return prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });
}

/** طلب محدّد يخصّ المستخدم (تحقّق ملكية). */
export function getUserOrder(orderId: number, userId: number) {
  return prisma.order.findFirst({
    where: { id: orderId, userId },
    include: { items: { include: { product: true } } },
  });
}
