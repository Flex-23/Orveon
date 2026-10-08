import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { requirePermission } from "@/lib/auth/guards";
import { getWorkById } from "@/server/queries/content";
import { WorkEditForm } from "@/components/dashboard/work-edit-form";

export const metadata = { title: "تعديل العمل | Orvion" };

export default async function WorkEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePermission("canManageContent");
  const { id } = await params;
  const work = await getWorkById(Number(id));
  if (!work) notFound();

  return (
    <main className="mx-auto max-w-2xl space-y-6">
      <Link
        href="/dashboard/content/works"
        className="inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-accent-strong"
      >
        <ArrowRight className="h-4 w-4" />
        كل الأعمال
      </Link>

      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">تعديل العمل</h1>
        <p className="mt-1.5 text-muted">حدّث عنوان العمل وشرحه وصورته كما يظهر في الصفحة الرئيسية.</p>
      </div>

      <WorkEditForm
        work={{
          id: work.id,
          title: work.title,
          description: work.description,
          imageUrl: work.imageUrl,
        }}
      />
    </main>
  );
}
