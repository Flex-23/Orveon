"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Plus, CheckCircle2, ImagePlus, Clapperboard, FileArchive } from "lucide-react";
import {
  createServiceAction,
  type ContentActionState,
} from "@/server/actions/admin-content";
import { FileField } from "./file-field";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-(--accent-contrast) transition-colors hover:bg-accent-strong disabled:opacity-60"
    >
      <Plus className="h-4 w-4" />
      {pending ? "جارٍ الحفظ..." : "إضافة الخدمة"}
    </button>
  );
}

const inputCls =
  "w-full rounded-lg border border-line bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-accent";

export function ServiceForm() {
  const [state, action] = useActionState<ContentActionState, FormData>(
    createServiceAction,
    {},
  );

  // إعادة ضبط النموذج بعد الإضافة الناجحة
  const [formKey, setFormKey] = useState(0);
  const [lastSuccess, setLastSuccess] = useState(state.success);
  if (state.success !== lastSuccess) {
    setLastSuccess(state.success);
    if (state.success) setFormKey((k) => k + 1);
  }

  return (
    <div className="flex flex-col gap-4">
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

      <form key={formKey} action={action} className="flex flex-col gap-5">
        {/* معلومات الخدمة */}
        <div className="grid gap-4">
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            عنوان الخدمة
            <input
              name="title"
              defaultValue={state.values?.title ?? ""}
              placeholder="مثال: تطوير تطبيقات الجوال"
              className={inputCls}
            />
            {state.fieldErrors?.title && (
              <span className="text-xs text-red-600">{state.fieldErrors.title}</span>
            )}
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            نص الشرح
            <textarea
              name="description"
              rows={4}
              defaultValue={state.values?.description ?? ""}
              placeholder="وصف موجز للخدمة يظهر للزوّار…"
              className={inputCls}
            />
          </label>
        </div>

        {/* الوسائط والملفات */}
        <div>
          <p className="mb-2.5 text-xs font-bold uppercase tracking-wide text-muted">
            الوسائط والملفات
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <FileField
              icon={ImagePlus}
              name="image"
              label="صورة واجهة الكارد"
              hint="صورة واحدة تظهر كواجهة الخدمة"
              accept="image/*"
            />
            <FileField
              icon={Clapperboard}
              name="videos"
              label="الفيديوهات التعليمية"
              hint="يمكن اختيار عدة فيديوهات"
              accept="video/*"
              multiple
            />
            <FileField
              icon={FileArchive}
              name="downloadFile"
              label="ملف التحميل المضغوط"
              hint="zip / rar — اختياري"
              accept=".zip,.rar,.7z,application/zip,application/x-rar-compressed"
            />
          </div>
        </div>

        <div>
          <Submit />
        </div>
      </form>
    </div>
  );
}
