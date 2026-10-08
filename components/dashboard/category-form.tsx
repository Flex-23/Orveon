"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Plus } from "lucide-react";
import {
  createCategoryAction,
  type AdminActionState,
} from "@/server/actions/admin-products";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex items-center gap-1 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-(--accent-contrast) transition-colors hover:bg-accent-strong disabled:opacity-60"
    >
      <Plus className="h-4 w-4" />
      {pending ? "..." : "إضافة قسم"}
    </button>
  );
}

export function CategoryForm() {
  const [state, action] = useActionState<AdminActionState, FormData>(
    createCategoryAction,
    {},
  );

  return (
    <form action={action} className="flex flex-col gap-2">
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <label className="mb-1 block text-sm font-medium">اسم القسم</label>
          <input
            name="name"
            defaultValue={state.values?.name ?? ""}
            placeholder="مثال: تطبيقات جوال"
            className="w-full rounded-lg border border-line bg-background px-3 py-2 outline-none transition-colors focus:border-accent"
          />
        </div>
        <Submit />
      </div>
      {state.fieldErrors?.name && (
        <span className="text-xs text-red-600">{state.fieldErrors.name}</span>
      )}
      {state.success && (
        <span className="text-xs text-emerald-600">{state.success}</span>
      )}
    </form>
  );
}
