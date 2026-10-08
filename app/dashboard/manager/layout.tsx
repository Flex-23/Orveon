import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/auth/guards";
import { canAccessDues, hasPermission, isManager } from "@/lib/auth/permissions";
import { ManagerSidebar } from "@/components/dashboard/manager-sidebar";

export default async function ManagerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireStaff();
  const manager = isManager(user.role);
  const canMembers = hasPermission(user, "canManageMembers");
  const canDues = canAccessDues(user);

  // المدير يدخل دائماً؛ الأدمن يحتاج صلاحية المشتركين أو المستحقات
  if (!manager && !canMembers && !canDues) redirect("/dashboard");

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6 px-4 py-8 md:flex-row md:px-6 lg:gap-8">
      <aside className="w-full shrink-0 md:w-60">
        <div className="sticky top-20 rounded-2xl border border-line bg-panel p-3 shadow-sm">
          <h2 className="mb-3 px-3 pt-1 text-xs font-bold uppercase tracking-wide text-muted">
            لوحة المدير
          </h2>
          <ManagerSidebar
            isManager={manager}
            canMembers={canMembers}
            canDues={canDues}
          />
        </div>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
