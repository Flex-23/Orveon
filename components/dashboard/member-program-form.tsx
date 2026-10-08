"use client";

// نموذج رفع ملف خدمة (مضغوط) لمشترك — يُعاد ضبطه بعد النجاح.
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Upload, CheckCircle2 } from "lucide-react";
import {
  uploadMemberProgramAction,
  type ManagerActionState,
} from "@/server/actions/manager";

const inputCls =
  "w-full rounded-lg border border-line bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-accent";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-(--accent-contrast) transition-colors hover:bg-accent-strong disabled:opacity-60"
    >
      <Upload className="h-4 w-4" />
      {pending ? "جارٍ الرفع..." : "رفع الملف"}
    </button>
  );
}

export function MemberProgramForm({ userId }: { userId: number }) {
  const [state, action] = useActionState<ManagerActionState, FormData>(
    uploadMemberProgramAction,
    {},
  );

  // إعادة ضبط حقول النموذج بعد رفع ناجح (إعادة تركيب عبر مفتاح متغيّر)
  const [formKey, setFormKey] = useState(0);
  const [lastSuccess, setLastSuccess] = useState(state.success);
  if (state.success !== lastSuccess) {
    setLastSuccess(state.success);
    if (state.success) setFormKey((k) => k + 1);
  }

  return (
    <div className="flex flex-col gap-3">
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

      <form key={formKey} action={action} className="flex flex-col gap-3">
        <input type="hidden" name="userId" value={userId} />
        <label className="flex flex-col gap-1 text-sm font-medium">
          عنوان الملف / الخدمة
          <input name="title" className={inputCls} />
          {state.fieldErrors?.title && (
            <span className="text-xs text-red-600">{state.fieldErrors.title}</span>
          )}
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          الملف المضغوط
          <input
            name="file"
            type="file"
            accept=".zip,.rar,.7z,application/zip,application/x-rar-compressed,application/x-7z-compressed"
            className="w-full rounded-lg border border-line bg-background px-3 py-1.5 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-accent-strong file:px-3 file:py-1.5 file:text-(--accent-contrast)"
          />
          {state.fieldErrors?.file && (
            <span className="text-xs text-red-600">{state.fieldErrors.file}</span>
          )}
        </label>
        <div>
          <Submit />
        </div>
      </form>
    </div>
  );
}
