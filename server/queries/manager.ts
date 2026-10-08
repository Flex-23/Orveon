// استعلامات لوحة المدير.
import { prisma } from "@/lib/prisma";

export function getAdmins() {
  return prisma.user.findMany({
    where: { role: "admin" },
    orderBy: { createdAt: "desc" },
    include: { permissions: true },
  });
}

/** أدمن واحد مع صلاحياته (لصفحة التفاصيل). */
export function getAdminById(id: number) {
  return prisma.user.findFirst({
    where: { id, role: "admin" },
    include: { permissions: true },
  });
}

/** المشتركون = الأعضاء الذين أنشأت الشركة لهم اشتراكاً. */
export function getSubscribers() {
  return prisma.user.findMany({
    where: { role: "member", subscriptions: { some: {} } },
    orderBy: { createdAt: "desc" },
    include: {
      subscriptions: { orderBy: { createdAt: "desc" } },
      _count: { select: { memberPrograms: true } },
    },
  });
}

/** مشترك واحد مع اشتراكاته وملفاته المرفوعة ومبالغه الإضافية (لصفحة التفاصيل). */
export function getSubscriberById(id: number) {
  return prisma.user.findFirst({
    where: { id, role: "member" },
    include: {
      subscriptions: { orderBy: { createdAt: "desc" } },
      memberPrograms: { orderBy: { createdAt: "desc" } },
      extraCharges: { orderBy: { createdAt: "desc" } },
    },
  });
}

/**
 * المشتركون الذين عليهم مبلغ متبقٍّ (الكلي > الواصل) في آخر اشتراك لهم.
 * الباقي محسوب في التطبيق (Prisma لا يقارن عمودين مباشرةً)، وعدد المشتركين صغير.
 */
export async function getSubscribersWithDues() {
  const members = await prisma.user.findMany({
    where: { role: "member" },
    include: {
      subscriptions: { orderBy: { createdAt: "desc" }, take: 1 },
      extraCharges: true,
    },
  });

  return members
    .map((m) => {
      const sub = m.subscriptions[0];
      const subRemaining = Math.max(
        0,
        Number(sub?.totalAmount ?? 0) - Number(sub?.paidAmount ?? 0),
      );
      // الباقي من المبالغ الإضافية المستقلّة (تحديث خدمة / نظام آخر).
      const extrasRemaining = m.extraCharges.reduce(
        (s, c) => s + Math.max(0, Number(c.amount) - Number(c.paidAmount)),
        0,
      );
      return {
        id: m.id,
        name: m.name,
        phone: m.phone,
        serviceName: sub?.serviceName ?? "—",
        // إجمالي المستحق = باقي الاشتراك الأصلي + باقي كل المبالغ الإضافية.
        remaining: subRemaining + extrasRemaining,
      };
    })
    .filter((m) => m.remaining > 0)
    .sort((a, b) => b.remaining - a.remaining);
}

/** الملفات/البرامج المرفوعة لمشترك (لصفحة بروفايله). */
export function getMemberPrograms(userId: number) {
  return prisma.memberProgram.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}
