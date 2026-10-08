import { getCurrentUser } from "@/lib/auth/session";
import { hasPermission, isManager } from "@/lib/auth/permissions";
import { StoreSidebar } from "@/components/dashboard/store-sidebar";

export default async function StoreDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = (await getCurrentUser())!; // مضمون بواسطة /dashboard/layout
  const manager = isManager(user.role);
  const canProducts = manager || hasPermission(user, "canManageProducts");

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6 px-4 py-8 md:flex-row md:px-6 lg:gap-8">
      <aside className="w-full shrink-0 md:w-64">
        <div className="sticky top-20 rounded-2xl border border-line bg-panel p-3 shadow-sm">
          <h2 className="mb-3 px-3 pt-1 text-xs font-bold uppercase tracking-wide text-muted">
            لوحة المتجر
          </h2>
          <StoreSidebar
            canProducts={canProducts}
            canReservations={manager || hasPermission(user, "canManageReservations")}
            canOrders={manager || hasPermission(user, "canManageOrders")}
          />
        </div>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
