import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { isManager } from "@/lib/auth/permissions";

export default async function ManagerDashboardIndex() {
  const user = await getCurrentUser();
  // المدير يبدأ من إدارة الأدمن؛ الأدمن صاحب صلاحية المشتركين يذهب إليهم مباشرة
  redirect(
    user && isManager(user.role)
      ? "/dashboard/manager/admins"
      : "/dashboard/manager/members",
  );
}
