// إشعارات الطاقم (المدير/الأدمن) — تجمع العناصر التي تحتاج انتباهاً.
// مصمَّمة لتكون قابلة للتوسّع: أضف نوعاً جديداً بإضافة كتلة جديدة تُلحق عناصرها
// بـ `collected` وتزيد `count`، دون تغيير الواجهة.
import "server-only";
import { prisma } from "@/lib/prisma";
import { hasPermission, isManager } from "@/lib/auth/permissions";
import { formatDate } from "@/lib/format";
import type { AdminPermission, Role } from "@/lib/generated/prisma";

export type NotificationKind = "order" | "reservation" | "project";

export type StaffNotification = {
  id: string; // مفتاح فريد عبر الأنواع، مثل "order-12"
  kind: NotificationKind;
  title: string;
  subtitle: string;
  href: string;
  time: string; // منسّق مسبقاً على الخادم (يتفادى اختلاف الترطيب)
};

export type StaffNotifications = {
  items: StaffNotification[];
  count: number;
};

type Actor = { role: Role; permissions: AdminPermission | null };

// عنصر داخلي يحمل الطابع الزمني للفرز قبل تحويله للشكل المعروض.
type Collected = StaffNotification & { ts: number };

const MAX_ITEMS = 8;

/** يجمع إشعارات الطاقم حسب صلاحيات المستخدم (المدير يرى الكل). */
export async function getStaffNotifications(user: Actor): Promise<StaffNotifications> {
  const manager = isManager(user.role);
  const canOrders = manager || hasPermission(user, "canManageOrders");
  const canReservations = manager || hasPermission(user, "canManageReservations");
  const canProjects = manager || hasPermission(user, "canManageProjects");

  const collected: Collected[] = [];
  let count = 0;

  // 1) طلبات المنتجات الجديدة (قيد الانتظار)
  if (canOrders) {
    const [orders, pending] = await Promise.all([
      prisma.order.findMany({
        where: { orderStatus: "pending" },
        orderBy: { createdAt: "desc" },
        take: MAX_ITEMS,
        include: { user: { select: { name: true } } },
      }),
      prisma.order.count({ where: { orderStatus: "pending" } }),
    ]);
    count += pending;
    for (const o of orders) {
      collected.push({
        id: `order-${o.id}`,
        kind: "order",
        title: `طلب جديد #${o.id}`,
        subtitle: o.deliveryName || o.user?.name || "زبون",
        href: `/dashboard/store/orders/${o.id}`,
        time: formatDate(o.createdAt),
        ts: o.createdAt.getTime(),
      });
    }
  }

  // 2) طلبات الحجز الجديدة (قيد الانتظار)
  if (canReservations) {
    const [reservations, pending] = await Promise.all([
      prisma.reservation.findMany({
        where: { status: "pending" },
        orderBy: { createdAt: "desc" },
        take: MAX_ITEMS,
        include: {
          product: { select: { name: true } },
          user: { select: { name: true } },
        },
      }),
      prisma.reservation.count({ where: { status: "pending" } }),
    ]);
    count += pending;
    for (const r of reservations) {
      const who = r.name || r.user?.name;
      collected.push({
        id: `reservation-${r.id}`,
        kind: "reservation",
        title: `حجز جديد #${r.id}`,
        subtitle: who ? `${r.product?.name ?? "منتج"} — ${who}` : (r.product?.name ?? "حجز"),
        href: `/dashboard/store/reservations/${r.id}`,
        time: formatDate(r.createdAt),
        ts: r.createdAt.getTime(),
      });
    }
  }

  // 3) طلبات المشاريع الجديدة (قيد الانتظار)
  if (canProjects) {
    const [projects, pending] = await Promise.all([
      prisma.projectRequest.findMany({
        where: { status: "pending" },
        orderBy: { createdAt: "desc" },
        take: MAX_ITEMS,
        include: { user: { select: { name: true } } },
      }),
      prisma.projectRequest.count({ where: { status: "pending" } }),
    ]);
    count += pending;
    for (const p of projects) {
      collected.push({
        id: `project-${p.id}`,
        kind: "project",
        title: `طلب مشروع جديد #${p.id}`,
        subtitle: p.name || p.user?.name || "زبون",
        href: `/dashboard/projects/${p.id}`,
        time: formatDate(p.createdAt),
        ts: p.createdAt.getTime(),
      });
    }
  }

  // ادمج الأنواع وافرز حسب الأحدث ثم اقتطع
  collected.sort((a, b) => b.ts - a.ts);
  const items: StaffNotification[] = collected.slice(0, MAX_ITEMS).map((c) => ({
    id: c.id,
    kind: c.kind,
    title: c.title,
    subtitle: c.subtitle,
    href: c.href,
    time: c.time,
  }));

  return { items, count };
}
