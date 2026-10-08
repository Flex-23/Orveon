import { requirePermission } from "@/lib/auth/guards";
import { ContentSidebar } from "@/components/dashboard/content-sidebar";

export default async function ContentDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requirePermission("canManageContent");

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6 px-4 py-8 md:flex-row md:px-6 lg:gap-8">
      <aside className="w-full shrink-0 md:w-60">
        <div className="sticky top-20 rounded-2xl border border-line bg-panel p-3 shadow-sm">
          <h2 className="mb-3 px-3 pt-1 text-xs font-bold uppercase tracking-wide text-muted">
            لوحة المحتوى
          </h2>
          <ContentSidebar />
        </div>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
