import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { requirePermission } from "@/lib/auth/guards";
import { getTrialRequestById } from "@/server/queries/admin";
import { updateTrialStatusAction } from "@/server/actions/admin-trials";
import { formatDateTime } from "@/lib/format";
import { TRIAL_STATUS_LABELS } from "@/lib/order-labels";
import { StatusSelect } from "@/components/dashboard/status-select";

export const metadata = { title: "تفاصيل الطلب | Orvion" };

export default async function TrialDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePermission("canManageContent");
  const { id } = await params;
  const trial = await getTrialRequestById(Number(id));
  if (!trial) notFound();

  const statusOptions = Object.entries(TRIAL_STATUS_LABELS).map(
    ([value, label]) => ({ value, label }),
  );

  return (
    <main className="max-w-2xl">
      <Link
        href="/dashboard/content/trials"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted hover:text-accent-strong"
      >
        <ArrowRight className="h-4 w-4" />
        كل الطلبات
      </Link>

      <h1 className="mb-6 text-2xl font-bold">طلب #{trial.id}</h1>

      <div className="grid gap-4 rounded-2xl border border-line bg-panel p-6 shadow-sm sm:grid-cols-2">
        <Detail label="الخدمة المطلوبة" value={trial.workTitle} />
        <Detail label="اسم الشخص" value={trial.name ?? trial.user?.name ?? "—"} />
        <Detail label="رقم الهاتف" value={trial.phone ?? trial.user?.phone ?? "—"} />
        <Detail label="المحافظة" value={trial.governorate ?? "—"} />
        <Detail label="تاريخ الطلب" value={formatDateTime(trial.createdAt)} />
        <Detail label="الحالة" value={TRIAL_STATUS_LABELS[trial.status]} />
        <div className="sm:col-span-2">
          <Detail label="التفاصيل" value={trial.details ?? "—"} />
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-line bg-panel p-6 shadow-sm">
        <h2 className="mb-3 font-semibold">تغيير الحالة</h2>
        <StatusSelect
          action={updateTrialStatusAction}
          idName="trialId"
          idValue={trial.id}
          name="status"
          value={trial.status}
          options={statusOptions}
        />
      </div>
    </main>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
