// بطاقة خدمة للعرض — التعديل يفتح صفحة مستقلّة للعنصر، مع حذف سريع.
import Image from "next/image";
import Link from "next/link";
import { Pencil, Trash2, Video, FileDown } from "lucide-react";
import { deleteServiceAction } from "@/server/actions/admin-content";
import { ConfirmDeleteForm } from "./confirm-delete-form";

export type ServiceCardData = {
  id: number;
  title: string;
  description: string | null;
  downloadFileUrl: string | null;
  images: { id: number; imageUrl: string }[];
  videos: { id: number; videoUrl: string; title: string | null }[];
};

export function ServiceCard({ service }: { service: ServiceCardData }) {
  const cover = service.images[0]?.imageUrl ?? null;

  return (
    <li className="overflow-hidden rounded-2xl border border-line bg-panel shadow-sm transition-all hover:border-accent/30 hover:shadow-md">
      <div className="flex flex-col gap-4 p-4 sm:flex-row">
        {/* صورة واجهة الكارد */}
        <Link
          href={`/dashboard/content/services/${service.id}`}
          className="relative block aspect-16/10 w-full shrink-0 overflow-hidden rounded-xl border border-line bg-foreground/5 sm:w-44"
        >
          {cover ? (
            <Image
              src={cover}
              alt={service.title}
              fill
              sizes="(min-width: 640px) 176px, 100vw"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-3xl font-black text-accent/25">
              {service.title.charAt(0)}
            </div>
          )}
        </Link>

        {/* المعلومات */}
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="min-w-0">
            <h3 className="text-lg font-semibold tracking-tight">{service.title}</h3>
            {service.description && (
              <p className="mt-1 line-clamp-2 text-sm text-muted">{service.description}</p>
            )}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-foreground/5 px-2.5 py-1 text-xs font-medium text-muted">
              <Video className="h-3.5 w-3.5" />
              {service.videos.length} فيديو
            </span>
            {service.downloadFileUrl && (
              <a
                href={service.downloadFileUrl}
                download
                className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-600 transition-colors hover:bg-emerald-500/20 dark:text-emerald-400"
              >
                <FileDown className="h-3.5 w-3.5" />
                ملف للتحميل
              </a>
            )}
          </div>

          <div className="mt-4 flex items-center gap-2 border-t border-line pt-3">
            <Link
              href={`/dashboard/content/services/${service.id}`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-sm font-medium text-accent-strong transition-all hover:border-accent/40 hover:bg-accent/10 active:scale-95"
            >
              <Pencil className="h-3.5 w-3.5" />
              تعديل
            </Link>
            <ConfirmDeleteForm
              action={deleteServiceAction}
              fields={{ serviceId: service.id }}
              message={`حذف الخدمة «${service.title}»؟`}
              description="تُحذف صورها وفيديوهاتها معها — لا يمكن التراجع."
              successMessage="تم حذف الخدمة."
              className="ms-auto"
            >
              <button
                type="submit"
                aria-label="حذف الخدمة"
                title="حذف الخدمة"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-line text-red-500 transition-all hover:border-red-500/40 hover:bg-red-500/10 active:scale-95"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </ConfirmDeleteForm>
          </div>
        </div>
      </div>
    </li>
  );
}
