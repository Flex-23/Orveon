import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { requirePermission } from "@/lib/auth/guards";
import { getProjectRequestById } from "@/server/queries/admin";
import { updateProjectStatusAction } from "@/server/actions/admin-projects";
import { formatDateTime } from "@/lib/format";
import { PROJECT_STATUS_LABELS } from "@/lib/order-labels";
import { StatusSelect } from "@/components/dashboard/status-select";

export const metadata = { title: "تفاصيل طلب المشروع | Orvion" };

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePermission("canManageProjects");
  const { id } = await params;
  const project = await getProjectRequestById(Number(id));
  if (!project) notFound();

  const statusOptions = Object.entries(PROJECT_STATUS_LABELS).map(
    ([value, label]) => ({ value, label }),
  );

  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-12">
      <Link
        href="/dashboard/projects"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted hover:text-accent-strong"
      >
        <ArrowRight className="h-4 w-4" />
        كل الطلبات
      </Link>

      <h1 className="mb-6 text-2xl font-bold">طلب مشروع #{project.id}</h1>

      <div className="grid gap-4 rounded-2xl border border-line bg-panel p-6 shadow-sm sm:grid-cols-2">
        <Detail label="اسم الشخص" value={project.name ?? project.user?.name ?? "—"} />
        <Detail label="رقم الهاتف" value={project.phone ?? project.user?.phone ?? "—"} />
        <Detail label="المحافظة" value={project.governorate ?? "—"} />
        <Detail label="المدة المتوقعة" value={project.duration} />
        <Detail label="تاريخ الطلب" value={formatDateTime(project.createdAt)} />
        <Detail label="الحالة" value={PROJECT_STATUS_LABELS[project.status]} />
        <div className="sm:col-span-2">
          <dt className="text-sm text-muted">وصف المشروع</dt>
          <dd className="whitespace-pre-wrap font-medium">{project.description}</dd>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-line bg-panel p-6 shadow-sm">
        <h2 className="mb-1 font-semibold">تغيير الحالة</h2>
        <p className="mb-3 text-sm text-muted">
          الحالة تظهر للزبون مباشرة في الصفحة الرئيسية.
        </p>
        <StatusSelect
          action={updateProjectStatusAction}
          idName="projectId"
          idValue={project.id}
          name="status"
          value={project.status}
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
