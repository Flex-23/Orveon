// استعلامات الحجوزات (لجهة الزبون).
import { prisma } from "@/lib/prisma";

export function getUserReservations(userId: number) {
  return prisma.reservation.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { product: true },
  });
}
