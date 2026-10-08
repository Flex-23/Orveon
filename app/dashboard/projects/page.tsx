import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { requirePermission } from "@/lib/auth/guards";
import { getAllProjectRequests } from "@/server/queries/admin";
import { DataList, DataRow, DataCell } from "@/components/dashboard/data-list";
import {
  PROJECT_STATUS_LABELS,
  PROJECT_STATUS_BADGE,
  PROJECT_STATUS_DOT,
} from "@/lib/order-labels";

export const metadata = { title: "طلبات المشاريع | Orvion" };

const COLS = "minmax(0,1.5fr) minmax(0,1.2fr) 1fr auto";

export default async function ProjectsAdminPage() {
  await requirePermission("canManageProjects");
  const projects = await getAllProjectRequests();

  return (
    <main className="mx-auto w-full max-w-5xl space-y-8 px-6 py-12">
      <div>
        <Link
          href="/dashboard"
          className="mb-4 inline-flex items-center gap-1 text-sm text-muted hover:text-accent-strong"
        >
          <ArrowRight className="h-4 w-4" />
          كل اللوحات
        </Link>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">طلبات المشاريع</h1>
        <p className="mt-1.5 text-muted">
          {projects.length} طلب — اضغط على أي طلب لعرض تفاصيله وتغيير حالته.
        </p>
      </div>

      {projects.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line p-10 text-center text-muted">
          لا توجد طلبات بعد.
        </p>
      ) : (
        <DataList cols={COLS} headers={["الاسم", "المدة المتوقعة", "الحالة", ""]}>
          {projects.map((p) => {
            const name = p.name ?? p.user?.name ?? "—";
            return (
              <DataRow key={p.id} cols={COLS}>
                {/* الاسم */}
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/10 text-xs font-bold text-accent-strong">
                    {name.charAt(0)}
                  </span>
                  <span className="truncate font-semibold">{name}</span>
                </div>

                {/* المدة */}
                <DataCell label="المدة المتوقعة">
                  <span className="truncate text-muted">{p.duration}</span>
                </DataCell>

                {/* الحالة */}
                <DataCell label="الحالة">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${PROJECT_STATUS_BADGE[p.status]}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${PROJECT_STATUS_DOT[p.status]}`} />
                    {PROJECT_STATUS_LABELS[p.status]}
                  </span>
                </DataCell>

                {/* التفاصيل */}
                <div className="border-t border-line pt-3 md:border-0 md:pt-0 md:text-end">
                  <Link
                    href={`/dashboard/projects/${p.id}`}
                    className="inline-flex w-full items-center justify-center gap-1 rounded-lg border border-line px-3 py-2 text-sm font-medium text-accent-strong transition-colors hover:bg-accent/10 md:w-auto md:py-1.5"
                  >
                    التفاصيل
                    <ArrowLeft className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </DataRow>
            );
          })}
        </DataList>
      )}
    </main>
  );
}
