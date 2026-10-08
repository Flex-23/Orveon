import { Wallet, Phone } from "lucide-react";
import { requireDuesAccess } from "@/lib/auth/guards";
import { getSubscribersWithDues } from "@/server/queries/manager";
import { formatPrice } from "@/lib/format";
import { DuesActions } from "@/components/dashboard/dues-actions";

export const metadata = { title: "مستحقات الدفع | Orvion" };

export default async function DuesPage() {
  await requireDuesAccess();
  const dues = await getSubscribersWithDues();

  const totalRemaining = dues.reduce((sum, d) => sum + d.remaining, 0);

  return (
    <main className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight sm:text-3xl">
            <Wallet className="h-7 w-7 text-accent-strong" />
            مستحقات الدفع
          </h1>
          <p className="mt-1.5 text-muted">
            المشتركون الذين لم يُدفع حسابهم بالكامل وعليهم مبلغ متبقٍّ.
          </p>
        </div>
        {dues.length > 0 && (
          <div className="rounded-2xl border border-line bg-panel px-5 py-3 text-center shadow-sm">
            <p className="text-xs font-medium text-muted">إجمالي المتبقّي</p>
            <p className="tabular mt-1 text-xl font-bold text-red-600 dark:text-red-400" dir="ltr">
              {formatPrice(totalRemaining)}
            </p>
          </div>
        )}
      </div>

      {dues.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-panel p-12 text-center">
          <Wallet className="mx-auto mb-3 h-10 w-10 text-emerald-500" />
          <p className="font-semibold">لا توجد مستحقات</p>
          <p className="mt-1 text-sm text-muted">
            جميع المشتركين سدّدوا حساباتهم بالكامل.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {dues.map((d) => (
            <li
              key={d.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-panel p-4 shadow-sm transition-colors hover:border-accent/30"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-accent/15 to-accent/5 text-sm font-bold text-accent-strong ring-1 ring-accent/10">
                  {d.name.charAt(0)}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-semibold">{d.name}</p>
                  <p className="flex items-center gap-1.5 text-xs text-muted">
                    <Phone className="h-3.5 w-3.5" />
                    <span className="tabular" dir="ltr">{d.phone}</span>
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-4">
                <div className="text-left">
                  <p className="text-xs font-medium text-muted">المبلغ الباقي</p>
                  <p className="tabular text-lg font-bold text-red-600 dark:text-red-400" dir="ltr">
                    {formatPrice(d.remaining)}
                  </p>
                </div>
                <DuesActions userId={d.id} remaining={d.remaining} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
