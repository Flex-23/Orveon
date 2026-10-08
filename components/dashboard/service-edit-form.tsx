"use client";

// نموذج تعديل خدمة — صفحة مستقلّة للعنصر: الحقول + إدارة الوسائط (صورة، فيديوهات، ملف).
import Image from "next/image";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  Check,
  Trash2,
  Video,
  FileDown,
  ImagePlus,
  Clapperboard,
  FileArchive,
  CheckCircle2,
} from "lucide-react";
import {
  updateServiceAction,
  deleteServiceVideoAction,
  type ContentActionState,
} from "@/server/actions/admin-content";
import { ConfirmDeleteForm } from "./confirm-delete-form";
import { FileField } from "./file-field";

export type ServiceEditData = {
  id: number;
  title: string;
  description: string | null;
  downloadFileUrl: string | null;
  images: { id: number; imageUrl: string }[];
  videos: { id: number; videoUrl: string; title: string | null }[];
};

const inputCls =
  "w-full rounded-lg border border-line bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-accent";

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-(--accent-contrast) transition-colors hover:bg-accent-strong disabled:opacity-60"
    >
      <Check className="h-4 w-4" />
      {pending ? "جارٍ الحفظ..." : "حفظ التعديلات"}
    </button>
  );
}

export function ServiceEditForm({ service }: { service: ServiceEditData }) {
  const [state, action] = useActionState<ContentActionState, FormData>(
    updateServiceAction,
    {},
  );

  const cover = service.images[0]?.imageUrl ?? null;

  return (
    <div className="space-y-6">
      {/* بطاقة المعاينة */}
      <section className="overflow-hidden rounded-2xl border border-line bg-panel shadow-sm">
        <div className="flex flex-col gap-4 p-4 sm:flex-row">
          <div className="relative aspect-16/10 w-full shrink-0 overflow-hidden rounded-xl border border-line bg-foreground/5 sm:w-52">
            {cover ? (
              <Image
                src={cover}
                alt={service.title}
                fill
                sizes="(min-width: 640px) 208px, 100vw"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-3xl font-black text-accent/25">
                {service.title.charAt(0)}
              </div>
            )}
          </div>
          <div className="flex min-w-0 flex-1 flex-col">
            <h2 className="text-lg font-semibold tracking-tight">{service.title}</h2>
            {service.description && (
              <p className="mt-1 line-clamp-3 text-sm text-muted">{service.description}</p>
            )}
            <div className="mt-auto flex flex-wrap items-center gap-2 pt-3">
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
          </div>
        </div>
      </section>

      {/* إدارة الفيديوهات الحالية */}
      {service.videos.length > 0 && (
        <section className="rounded-2xl border border-line bg-panel p-5 shadow-sm">
          <p className="mb-3 text-xs font-bold uppercase tracking-wide text-muted">
            الفيديوهات الحالية
          </p>
          <ul className="flex flex-col gap-1.5">
            {service.videos.map((v) => (
              <li
                key={v.id}
                className="flex items-center justify-between gap-2 rounded-lg border border-line bg-background px-3 py-2 text-sm"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-accent/10 text-accent-strong">
                    <Video className="h-3.5 w-3.5" />
                  </span>
                  <span className="truncate">{v.title || "فيديو"}</span>
                </span>
                <ConfirmDeleteForm
                  action={deleteServiceVideoAction}
                  fields={{ videoId: v.id, serviceId: service.id }}
                  message={`حذف الفيديو «${v.title || "فيديو"}»؟`}
                  successMessage="تم حذف الفيديو."
                >
                  <button
                    type="submit"
                    aria-label="حذف الفيديو"
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-red-500 transition-colors hover:bg-red-500/10"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </ConfirmDeleteForm>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* نموذج تعديل الحقول والوسائط */}
      <form
        action={action}
        className="flex flex-col gap-4 rounded-2xl border border-line bg-panel p-6 shadow-sm"
      >
        <input type="hidden" name="serviceId" value={service.id} />

        {state.success && (
          <p className="flex items-center gap-2 rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-600 dark:text-emerald-300">
            <CheckCircle2 className="h-4 w-4" />
            {state.success}
          </p>
        )}
        {state.error && (
          <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-300">
            {state.error}
          </p>
        )}

        <label className="flex flex-col gap-1.5 text-sm font-medium">
          عنوان الخدمة
          <input name="title" defaultValue={service.title} className={inputCls} />
          {state.fieldErrors?.title && (
            <span className="text-xs text-red-600">{state.fieldErrors.title}</span>
          )}
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          نص الشرح
          <textarea
            name="description"
            rows={4}
            defaultValue={service.description ?? ""}
            className={inputCls}
          />
        </label>

        <div className="grid gap-3 sm:grid-cols-2">
          <FileField
            icon={ImagePlus}
            name="image"
            label="استبدال صورة الواجهة"
            hint="اختياري — تستبدل الصورة الحالية"
            accept="image/*"
          />
          <FileField
            icon={Clapperboard}
            name="videos"
            label="إضافة فيديوهات جديدة"
            hint="تُضاف للفيديوهات الحالية"
            accept="video/*"
            multiple
          />
          <FileField
            icon={FileArchive}
            name="downloadFile"
            label="استبدال ملف التحميل"
            hint="اختياري — zip / rar"
            accept=".zip,.rar,.7z,application/zip,application/x-rar-compressed"
          />
        </div>

        <div className="pt-1">
          <SaveButton />
        </div>
      </form>
    </div>
  );
}
