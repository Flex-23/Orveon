"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Plus } from "lucide-react";
import {
  createProductAction,
  type AdminActionState,
} from "@/server/actions/admin-products";
import { PriceInput } from "./price-input";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex items-center justify-center gap-1 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-(--accent-contrast) transition-colors hover:bg-accent-strong disabled:opacity-60"
    >
      <Plus className="h-4 w-4" />
      {pending ? "جارٍ الإضافة..." : "إضافة المادة"}
    </button>
  );
}

const inputCls =
  "w-full rounded-lg border border-line bg-background px-3 py-2 outline-none transition-colors focus:border-accent";

export function ProductForm({
  categories,
}: {
  categories: { id: number; name: string }[];
}) {
  const [state, action] = useActionState<AdminActionState, FormData>(
    createProductAction,
    {},
  );

  return (
    <form action={action} className="flex flex-col gap-4">
      {state.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
          {state.success}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">اسم المادة</label>
          <input name="name" defaultValue={state.values?.name ?? ""} className={inputCls} />
          {state.fieldErrors?.name && (
            <span className="text-xs text-red-600">{state.fieldErrors.name}</span>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">القسم</label>
          <select
            name="categoryId"
            defaultValue={state.values?.categoryId ?? ""}
            className={`${inputCls} dark:[&>option]:bg-zinc-900`}
          >
            <option value="">بدون قسم</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">الكمية</label>
          <input
            name="quantity"
            type="number"
            min={0}
            defaultValue={state.values?.quantity ?? 0}
            className={inputCls}
          />
          {state.fieldErrors?.quantity && (
            <span className="text-xs text-red-600">{state.fieldErrors.quantity}</span>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">السعر (د.ع)</label>
          <PriceInput name="price" defaultValue={state.values?.price} className={inputCls} />
          {state.fieldErrors?.price && (
            <span className="text-xs text-red-600">{state.fieldErrors.price}</span>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">الحالة</label>
          <select
            name="status"
            defaultValue={state.values?.status ?? "available"}
            className={`${inputCls} dark:[&>option]:bg-zinc-900`}
          >
            <option value="available">موجود</option>
            <option value="out_of_stock">نافذ</option>
            <option value="coming_soon">قريباً</option>
          </select>
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
      </div>

      <div>
        <Submit />
      </div>
    </form>
  );
}
