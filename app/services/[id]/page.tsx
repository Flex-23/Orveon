import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Download, PlayCircle } from "lucide-react";
import { getPublicServiceById } from "@/server/queries/content";
import { Reveal } from "@/components/home/reveal";
import { ServiceVideo } from "@/components/services/service-video";

// تمنع توليد الصفحة مسبقاً أثناء البناء حتى لا تُستدعى قاعدة البيانات وقت npm run build.
export const dynamic = "force-dynamic";

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const serviceId = Number(id);
  if (!Number.isInteger(serviceId)) notFound();

  const service = await getPublicServiceById(serviceId);
  if (!service) notFound();

  const cover = service.images[0]?.imageUrl ?? null;

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-12">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-accent-strong"
      >
        <ArrowRight className="h-4 w-4" />
        الصفحة الرئيسية
      </Link>

      {/* صورة الواجهة */}
      {cover && (
        <Reveal>
          <div className="relative mb-8 aspect-video w-full overflow-hidden rounded-2xl border border-border">
            <Image
              src={cover}
              alt={service.title}
              fill
              preload
              sizes="(min-width: 1024px) 976px, 100vw"
              className="object-cover"
            />
          </div>
        </Reveal>
      )}

      <Reveal>
        <header className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{service.title}</h1>
          {service.description && (
            <p className="mt-3 max-w-2xl text-pretty leading-relaxed text-muted">
              {service.description}
            </p>
          )}
          {service.downloadFileUrl && (
            <a
              href={service.downloadFileUrl}
              download
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 font-semibold text-(--accent-contrast) transition-colors hover:bg-accent-strong"
            >
              <Download className="h-5 w-5" />
              تحميل الملف
            </a>
          )}
        </header>
      </Reveal>

      {/* الفيديوهات التعليمية */}
      <section>
        <h2 className="mb-5 flex items-center gap-2 text-2xl font-bold tracking-tight">
          <PlayCircle className="h-6 w-6 text-accent-strong" />
          الفيديوهات التعليمية
        </h2>

        {service.videos.length === 0 ? (
          <p className="text-zinc-500">لا توجد فيديوهات لهذه الخدمة بعد.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            {service.videos.map((video) => (
              <Reveal key={video.id}>
                <figure className="overflow-hidden rounded-2xl border border-black/10 bg-black dark:border-white/10">
                  <ServiceVideo
                    src={video.videoUrl}
                    className="aspect-video w-full bg-black"
                  />
                  {video.title && (
                    <figcaption className="bg-background px-4 py-3 text-sm font-medium">
                      {video.title}
                    </figcaption>
                  )}
                </figure>
              </Reveal>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
