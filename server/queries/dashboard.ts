// إحصائيات لوحة تحكم المتجر.
import { prisma } from "@/lib/prisma";

export async function getStoreStats() {
  const [
    productsCount,
    categoriesCount,
    ordersCount,
    pendingOrders,
    pendingReservations,
    pendingTrials,
    outOfStock,
    salesAgg,
    deliveredAgg,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.category.count(),
    prisma.order.count(),
    prisma.order.count({ where: { orderStatus: "pending" } }),
    prisma.reservation.count({ where: { status: "pending" } }),
    prisma.trialRequest.count({ where: { status: "pending" } }),
    prisma.product.count({ where: { status: "out_of_stock" } }),
    prisma.order.aggregate({ _sum: { total: true } }),
    prisma.order.aggregate({
      _sum: { total: true },
      where: { orderStatus: "delivered" },
    }),
  ]);

  return {
    productsCount,
    categoriesCount,
    ordersCount,
    pendingOrders,
    pendingReservations,
    pendingTrials,
    outOfStock,
    totalSales: Number(salesAgg._sum.total ?? 0),
    realizedProfit: Number(deliveredAgg._sum.total ?? 0),
  };
}
