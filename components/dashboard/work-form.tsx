"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Plus } from "lucide-react";
import {
  createWorkAction,
  type ContentActionState,
} from "@/server/actions/admin-content";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex items-center gap-1 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-(--accent-contrast) transition-colors hover:bg-accent-strong disabled:opacity-60"
    >
      <Plus className="h-4 w-4" />
      {pending ? "جارٍ الإضافة..." : "إضافة عمل"}
    </button>
  );
}

const inputCls =
  "w-full rounded-lg border border-line bg-background px-3 py-2 outline-none transition-colors focus:border-accent";

export function WorkForm() {
  const [state, action] = useActionState<ContentActionState, FormData>(
    createWorkAction,
    {},
  );

  return (
    <form action={action} className="flex flex-col gap-4">
      {state.success && (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
          {state.success}
        </p>
      )}
      {state.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
          {state.error}
        </p>
      )}

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">عنوان العمل</label>
        <input name="title" defaultValue={state.values?.title ?? ""} className={inputCls} />
        {state.fieldErrors?.title && (
          <span className="text-xs text-red-600">{state.fieldErrors.title}</span>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">الشرح</label>
        <textarea
          name="description"
          rows={3}
          defaultValue={state.values?.description ?? ""}
          className={inputCls}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">الصورة</label>
        <input
          name="image"
          type="file"
          accept="image/*"
          className="w-full rounded-lg border border-line bg-background px-3 py-1.5 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-accent-strong file:px-3 file:py-1.5 file:text-(--accent-contrast)"
        />
      </div>

      <div>
        <Submit />
      </div>
    </form>
  );
}
