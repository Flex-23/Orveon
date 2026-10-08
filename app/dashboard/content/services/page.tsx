import { Plus } from "lucide-react";
import { getServices } from "@/server/queries/content";
import { ServiceForm } from "@/components/dashboard/service-form";
import { ServiceCard } from "@/components/dashboard/service-card";

export const metadata = { title: "إدارة الخدمات | Orvion" };

export default async function ServicesAdminPage() {
  const services = await getServices();

  return (
    <main className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">الخدمات</h1>
        <p className="mt-1.5 text-muted">
          أضف الخدمات وعدّل تفاصيلها ووسائطها (صور، فيديوهات، ملف تحميل).
        </p>
      </div>

      <section className="rounded-2xl border border-line bg-panel p-6 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 font-semibold">
          <Plus className="h-5 w-5 text-accent-strong" />
          إضافة خدمة
        </h2>
        <ServiceForm />
      </section>

      <section>
        <h2 className="mb-4 font-semibold">
          الخدمات <span className="tabular text-muted">({services.length})</span>
        </h2>
        {services.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-line p-8 text-center text-muted">
            لا توجد خدمات بعد.
          </p>
        ) : (
          <ul className="flex flex-col gap-4">
            {services.map((s) => (
              <ServiceCard
                key={s.id}
                service={{
                  id: s.id,
                  title: s.title,
                  description: s.description,
                  downloadFileUrl: s.downloadFileUrl,
                  images: s.images.map((i) => ({ id: i.id, imageUrl: i.imageUrl })),
                  videos: s.videos.map((v) => ({
                    id: v.id,
                    videoUrl: v.videoUrl,
                    title: v.title,
                  })),
                }}
              />
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
