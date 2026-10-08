// أدوات التحقق من الأدوار والصلاحيات (تُستخدم في الخادم).
import type { Role } from "@/lib/generated/prisma";

export type Permission =
  | "canAccessDashboard"
  | "canManageProducts"
  | "canManageOrders"
  | "canManageReservations"
  | "canManageMembers"
  | "canManageDues"
  | "canManageServices"
  | "canManageContent"
  | "canManageProjects";

export const PERMISSION_LABELS: Record<Permission, string> = {
  canAccessDashboard: "الوصول للوحة التحكم",
  canManageProducts: "إدارة المنتجات والأقسام",
  canManageOrders: "إدارة الطلبات",
  canManageReservations: "إدارة الحجوزات",
  canManageMembers: "الوصول للمشتركين وإدارتهم",
  canManageDues: "الوصول إلى مستحقات الدفع",
  canManageServices: "إضافة/تحديث خدمة لزبون",
  canManageContent: "إدارة محتوى الصفحة الرئيسية",
  canManageProjects: "إدارة طلبات المشاريع",
};

/** المدير له كل الصلاحيات دائماً. */
export function isManager(role: Role): boolean {
  return role === "manager";
}

export function isAdminOrManager(role: Role): boolean {
  return role === "admin" || role === "manager";
}

export function isLoggedIn(role: Role | undefined | null): boolean {
  return role === "member" || role === "admin" || role === "manager";
}

/**
 * هل يملك المستخدم صلاحية معيّنة؟
 * المدير يملك كل شيء. الأدمن حسب الأعلام (flags). غيرهم لا.
 */
export function hasPermission(
  user: {
    role: Role;
    permissions?: Record<Permission, boolean> | null;
  },
  permission: Permission,
): boolean {
  if (user.role === "manager") return true;
  if (user.role === "admin") return Boolean(user.permissions?.[permission]);
  return false;
}

/**
 * الوصول إلى مستحقات الدفع: متاح لمن يدير المشتركين (إدارة كاملة)
 * أو لمن مُنح صلاحية المستحقات وحدها.
 */
export function canAccessDues(user: {
  role: Role;
  permissions?: Record<Permission, boolean> | null;
}): boolean {
  return (
    hasPermission(user, "canManageMembers") || hasPermission(user, "canManageDues")
  );
}
