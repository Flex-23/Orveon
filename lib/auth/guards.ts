// حُرّاس الوصول للوحات التحكم (للاستخدام في الخادم).
import "server-only";
import { redirect } from "next/navigation";
import { getCurrentUser } from "./session";
import {
  canAccessDues,
  hasPermission,
  isAdminOrManager,
  type Permission,
} from "./permissions";

/** يتطلب أدمن أو مدير مع صلاحية الوصول للوحة. */
export async function requireStaff() {
  const user = await getCurrentUser();
  if (!user || !isAdminOrManager(user.role)) {
    redirect("/login?next=/dashboard");
  }
  // المدير دائماً مسموح؛ الأدمن يحتاج canAccessDashboard
  if (user.role === "admin" && !user.permissions?.canAccessDashboard) {
    redirect("/");
  }
  return user;
}

/** يتطلب صلاحية محدّدة (المدير يملك كل الصلاحيات). */
export async function requirePermission(permission: Permission) {
  const user = await requireStaff();
  if (!hasPermission(user, permission)) redirect("/dashboard");
  return user;
}

/** يتطلب الوصول إلى مستحقات الدفع (إدارة مشتركين أو صلاحية المستحقات). */
export async function requireDuesAccess() {
  const user = await requireStaff();
  if (!canAccessDues(user)) redirect("/dashboard");
  return user;
}

/** يتطلب أن يكون المستخدم مديراً. */
export async function requireManager() {
  const user = await getCurrentUser();
  if (!user || user.role !== "manager") redirect("/dashboard");
  return user;
}
