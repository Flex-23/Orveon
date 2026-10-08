"use client";

// صف/بطاقة منتج قابلة للتعديل: جدول على الديسكتوب، بطاقة على الجوال (عرض ↔ تعديل ضمني) مع حذف.
import type { CSSProperties } from "react";
import Image from "next/image";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Pencil, Trash2, X, Check } from "lucide-react";
import {
  updateProductAction,
  deleteProductAction,
  type AdminActionState,
} from "@/server/actions/admin-products";
import {
  effectiveStatus,
  STATUS_LABELS,
  STATUS_BADGE_CLASSES,
} from "@/lib/product-status";
import { formatPrice } from "@/lib/format";
import { ConfirmDeleteForm } from "./confirm-delete-form";
import { DataCell } from "./data-list";
import { PriceInput } from "./price-input";
import type { ProductStatus } from "@/lib/generated/prisma";

export type ProductRowData = {
  id: number;
  name: string;
  categoryId: number | null;
  categoryName: string | null;
  quantity: number;
  price: string;
  status: ProductStatus;
  imageUrl: string | null;
};

const inputCls =
  "w-full rounded-lg border border-line bg-background px-2.5 py-1.5 text-sm outline-none focus:border-accent";

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-2 text-sm font-semibold text-(--accent-contrast) transition-colors hover:bg-accent-strong disabled:opacity-60"
    >
      <Check className="h-4 w-4" />
      {pending ? "جارٍ الحفظ..." : "حفظ"}
    </button>
  );
}

export function ProductRow({
  product,
  categories,
  cols,
}: {
  product: ProductRowData;
  categories: { id: number; name: string }[];
  cols: string;
}) {
  const [editing, setEditing] = useState(false);
  const [state, action] = useActionState<AdminActionState, FormData>(
    updateProductAction,
    {},
  );

  // إغلاق وضع التعديل عند نجاح الحفظ — تعديل الحالة أثناء العرض عند تغيّر النتيجة
  // (النمط الموصى به في React بدل useEffect لمزامنة حالة مشتقّة).
  const [lastSuccess, setLastSuccess] = useState(state.success);
  if (state.success !== lastSuccess) {
    setLastSuccess(state.success);
    if (state.success && editing) setEditing(false);
  }

  const st = effectiveStatus(product);
  const grid: CSSProperties = { gridTemplateColumns: cols };

  return (
    <div className="rounded-2xl border border-line bg-panel p-4 shadow-sm transition-colors hover:border-accent/30 md:rounded-none md:border-0 md:border-b md:border-line md:bg-transparent md:p-0 md:shadow-none md:transition-colors md:last:border-b-0 md:hover:border-line md:hover:bg-foreground/2">
      {/* ملخّص المنتج */}
      <div style={grid} className="flex flex-col gap-3 md:grid md:items-center md:gap-4 md:px-5 md:py-4">
        {/* المادة */}
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-line bg-foreground/5 md:h-10 md:w-10">
            {product.imageUrl ? (
              <Image src={product.imageUrl} alt={product.name} fill sizes="48px" className="object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-xs font-bold text-muted">
                {product.name.charAt(0)}
              </span>
            )}
          </div>
          <span className="font-semibold">{product.name}</span>
        </div>

        {/* القسم */}
        <DataCell label="القسم">
          <span className="text-muted">{product.categoryName ?? "—"}</span>
        </DataCell>

        {/* الكمية */}
        <DataCell label="الكمية">
          <span className="tabular">{product.quantity}</span>
        </DataCell>

        {/* السعر */}
        <DataCell label="السعر">
          <span className="tabular font-semibold">{formatPrice(product.price)}</span>
        </DataCell>

        {/* الحالة */}
        <DataCell label="الحالة">
          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_BADGE_CLASSES[st]}`}>
            {STATUS_LABELS[st]}
          </span>
        </DataCell>

        {/* إجراءات */}
        <div className="flex items-center gap-1.5 border-t border-line pt-3 md:justify-end md:border-0 md:pt-0">
          <button
            type="button"
            onClick={() => setEditing((v) => !v)}
            aria-label={editing ? "إلغاء التعديل" : "تعديل"}
            className={`inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-sm font-medium transition-all active:scale-95 ${
              editing
                ? "border-line bg-foreground/10 text-foreground"
                : "border-line text-accent-strong hover:border-accent/40 hover:bg-accent/10"
            }`}
          >
            {editing ? <X className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
            <span>{editing ? "إلغاء" : "تعديل"}</span>
          </button>
          <ConfirmDeleteForm
            action={deleteProductAction}
            fields={{ productId: product.id }}
            message={`حذف المنتج «${product.name}»؟`}
            description="إن كان مرتبطاً بطلبات سابقة يُعلَّم نافذاً بدل حذفه."
            successMessage="تم حذف المنتج."
          >
            <button
              type="submit"
              aria-label="حذف"
              title="حذف"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-line text-red-500 transition-all hover:border-red-500/40 hover:bg-red-500/10 active:scale-95"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </ConfirmDeleteForm>
        </div>
      </div>

      {/* لوحة التعديل الموسّعة */}
      {editing && (
        <div className="mt-3 border-t border-line pt-4 md:mt-0 md:bg-foreground/2 md:px-5 md:py-4">
          <form action={action} className="flex flex-col gap-3">
            <input type="hidden" name="productId" value={product.id} />
            {state.error && (
              <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-300">
                {state.error}
              </p>
            )}

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <label className="flex flex-col gap-1 text-xs font-medium text-muted">
                اسم المادة
                <input name="name" defaultValue={product.name} className={inputCls} />
                {state.fieldErrors?.name && (
                  <span className="text-red-600">{state.fieldErrors.name}</span>
                )}
              </label>

              <label className="flex flex-col gap-1 text-xs font-medium text-muted">
                القسم
                <select
                  name="categoryId"
                  defaultValue={product.categoryId ?? ""}
                  className={`${inputCls} dark:[&>option]:bg-zinc-900`}
                >
                  <option value="">بدون قسم</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1 text-xs font-medium text-muted">
                الحالة
                <select
                  name="status"
                  defaultValue={product.status}
                  className={`${inputCls} dark:[&>option]:bg-zinc-900`}
                >
                  <option value="available">موجود</option>
                  <option value="out_of_stock">نافذ</option>
                  <option value="coming_soon">قريباً</option>
                </select>
              </label>

              <label className="flex flex-col gap-1 text-xs font-medium text-muted">
                الكمية
                <input name="quantity" type="number" min={0} defaultValue={product.quantity} className={inputCls} />
                {state.fieldErrors?.quantity && (
                  <span className="text-red-600">{state.fieldErrors.quantity}</span>
                )}
              </label>

              <label className="flex flex-col gap-1 text-xs font-medium text-muted">
                السعر (د.ع)
                <PriceInput name="price" defaultValue={product.price} className={inputCls} />
                {state.fieldErrors?.price && (
                  <span className="text-red-600">{state.fieldErrors.price}</span>
                )}
              </label>

              <label className="flex flex-col gap-1 text-xs font-medium text-muted">
                استبدال الصورة (اختياري)
                <input
                  name="image"
                  type="file"
                  accept="image/*"
                  className="w-full rounded-lg border border-line bg-background px-2.5 py-1 text-sm file:mr-2 file:rounded-md file:border-0 file:bg-accent-strong file:px-2.5 file:py-1 file:text-(--accent-contrast)"
                />
              </label>
            </div>

            <div className="flex items-center gap-2">
              <SaveButton />
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="rounded-lg border border-line px-3.5 py-2 text-sm font-medium transition-colors hover:bg-foreground/5"
              >
                إلغاء
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
