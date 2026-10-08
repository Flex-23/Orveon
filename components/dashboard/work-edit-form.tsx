"use client";

// نموذج تعديل عمل — صفحة مستقلّة للعنصر نفسه (لا تعديل ضمني داخل القائمة).
import Image from "next/image";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Check, ImagePlus, CheckCircle2 } from "lucide-react";
import {
  updateWorkAction,
  type ContentActionState,
} from "@/server/actions/admin-content";
import { FileField } from "./file-field";

export type WorkEditData = {
  id: number;
  title: string;
  description: string | null;
  imageUrl: string | null;
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

export function WorkEditForm({ work }: { work: WorkEditData }) {
  const [state, action] = useActionState<ContentActionState, FormData>(
    updateWorkAction,
    {},
  );

  return (
    <section className="overflow-hidden rounded-2xl border border-line bg-panel shadow-sm">
      {/* معاينة الصورة الحالية */}
      <div className="relative aspect-16/9 w-full overflow-hidden bg-foreground/5">
        {work.imageUrl ? (
          <Image
            src={work.imageUrl}
            alt={work.title}
            fill
            sizes="(min-width: 1024px) 768px, 100vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-5xl font-black text-accent/25">
            {work.title.charAt(0)}
          </div>
        )}
      </div>

      <form action={action} className="flex flex-col gap-4 p-6">
        <input type="hidden" name="workId" value={work.id} />

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
          العنوان
          <input name="title" defaultValue={work.title} className={inputCls} />
          {state.fieldErrors?.title && (
            <span className="text-xs text-red-600">{state.fieldErrors.title}</span>
          )}
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium">
          الشرح
          <textarea
            name="description"
            rows={4}
            defaultValue={work.description ?? ""}
            className={inputCls}
          />
        </label>

        <FileField
          icon={ImagePlus}
          name="image"
          label="استبدال الصورة"
          hint="اختياري — اتركه للإبقاء على الصورة الحالية"
          accept="image/*"
        />

        <div className="pt-1">
          <SaveButton />
        </div>
      </form>
    </section>
  );
}
