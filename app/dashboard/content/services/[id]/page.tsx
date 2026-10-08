import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { requirePermission } from "@/lib/auth/guards";
import { getServiceById } from "@/server/queries/content";
import { ServiceEditForm } from "@/components/dashboard/service-edit-form";

export const metadata = { title: "تعديل الخدمة | Orvion" };

export default async function ServiceEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePermission("canManageContent");
  const { id } = await params;
  const service = await getServiceById(Number(id));
  if (!service) notFound();

  return (
    <main className="mx-auto max-w-3xl space-y-6">
      <Link
        href="/dashboard/content/services"
        className="inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-accent-strong"
      >
        <ArrowRight className="h-4 w-4" />
        كل الخدمات
      </Link>

      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">تعديل الخدمة</h1>
        <p className="mt-1.5 text-muted">
          حدّث تفاصيل الخدمة ووسائطها (صورة الواجهة، الفيديوهات، ملف التحميل).
        </p>
      </div>

      <ServiceEditForm
        service={{
          id: service.id,
          title: service.title,
          description: service.description,
          downloadFileUrl: service.downloadFileUrl,
          images: service.images.map((i) => ({ id: i.id, imageUrl: i.imageUrl })),
          videos: service.videos.map((v) => ({
            id: v.id,
            videoUrl: v.videoUrl,
            title: v.title,
          })),
        }}
      />
    </main>
  );
}
