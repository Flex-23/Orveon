import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requirePermission } from "@/lib/auth/guards";
import { getAllTrialRequests } from "@/server/queries/admin";
import { DataList, DataRow, DataCell } from "@/components/dashboard/data-list";
import {
  TRIAL_STATUS_LABELS,
  TRIAL_STATUS_BADGE,
  TRIAL_STATUS_DOT,
} from "@/lib/order-labels";

export const metadata = { title: "طلبات النسخ التجريبية | Orvion" };

const COLS = "minmax(0,1.5fr) minmax(0,1.7fr) 1fr auto";

export default async function TrialsAdminPage() {
  await requirePermission("canManageContent");
  const trials = await getAllTrialRequests();

  return (
    <main className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">طلبات النسخ التجريبية</h1>
        <p className="mt-1.5 text-muted">
          {trials.length} طلب — اضغط على أي طلب لعرض تفاصيله وتغيير حالته.
        </p>
      </div>

      {trials.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line p-10 text-center text-muted">
          لا توجد طلبات بعد.
        </p>
      ) : (
        <DataList
          cols={COLS}
          headers={["الاسم", "الخدمة المطلوبة", "الحالة", ""]}
        >
          {trials.map((t) => {
            const name = t.name ?? t.user?.name ?? "—";
            return (
              <DataRow key={t.id} cols={COLS}>
                {/* الاسم */}
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/10 text-xs font-bold text-accent-strong">
                    {name.charAt(0)}
                  </span>
                  <span className="truncate font-semibold">{name}</span>
                </div>

                {/* الخدمة المطلوبة */}
                <DataCell label="الخدمة المطلوبة">
                  <span className="truncate text-muted">{t.workTitle}</span>
                </DataCell>

                {/* الحالة */}
                <DataCell label="الحالة">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${TRIAL_STATUS_BADGE[t.status]}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${TRIAL_STATUS_DOT[t.status]}`} />
                    {TRIAL_STATUS_LABELS[t.status]}
                  </span>
                </DataCell>

                {/* التفاصيل */}
                <div className="border-t border-line pt-3 md:border-0 md:pt-0 md:text-end">
                  <Link
                    href={`/dashboard/content/trials/${t.id}`}
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
