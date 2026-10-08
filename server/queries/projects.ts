// استعلامات طلبات المشاريع الخاصة بالزبون (خارج لوحة التحكم).
import "server-only";
import { prisma } from "@/lib/prisma";

/** آخر طلبات المشاريع للزبون — لعرض حالتها في الصفحة الرئيسية. */
export function getUserProjectRequests(userId: number) {
  return prisma.projectRequest.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 3,
  });
}
