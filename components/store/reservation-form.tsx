"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { CalendarClock } from "lucide-react";
import { reserveAction, type ReserveState } from "@/server/actions/reservations";
import { GOVERNORATES } from "@/lib/validations/auth";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-amber-600 disabled:opacity-60"
    >
      <CalendarClock className="h-4 w-4" />
      {pending ? "جارٍ إرسال الحجز..." : "تأكيد الحجز"}
    </button>
  );
}

const inputCls =
  "w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 outline-none focus:border-amber-500 dark:border-white/15";

type Props = {
  productId: number;
  /** بيانات الزبون المسجّلة — تُملأ تلقائياً ويمكن تعديلها. */
  defaultName?: string;
  defaultPhone?: string;
  defaultGovernorate?: string;
};

export function ReservationForm({
  productId,
  defaultName = "",
  defaultPhone = "",
  defaultGovernorate = "",
}: Props) {
  const [state, formAction] = useActionState<ReserveState, FormData>(
    reserveAction,
    {},
  );

  const presetGovernorate = GOVERNORATES.includes(
    defaultGovernorate as (typeof GOVERNORATES)[number],
  )
    ? defaultGovernorate
    : "";

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <input type="hidden" name="productId" value={productId} />

      {state.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
          {state.error}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">الاسم</label>
          <input name="name" defaultValue={defaultName} className={inputCls} />
          {state.fieldErrors?.name && (
            <span className="text-xs text-red-600">{state.fieldErrors.name}</span>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">رقم الهاتف</label>
          <input
            name="phone"
            type="tel"
            defaultValue={defaultPhone}
            className={inputCls}
          />
          {state.fieldErrors?.phone && (
            <span className="text-xs text-red-600">{state.fieldErrors.phone}</span>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">المحافظة</label>
          <select
            name="governorate"
            defaultValue={presetGovernorate}
            className={`${inputCls} dark:[&>option]:bg-zinc-900`}
          >
            <option value="">اختر المحافظة</option>
            {GOVERNORATES.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
          {state.fieldErrors?.governorate && (
            <span className="text-xs text-red-600">{state.fieldErrors.governorate}</span>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">الكمية</label>
          <input
            name="quantity"
            type="number"
            min={1}
            defaultValue={1}
            className={inputCls}
          />
          {state.fieldErrors?.quantity && (
            <span className="text-xs text-red-600">{state.fieldErrors.quantity}</span>
          )}
        </div>
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <label className="text-sm font-medium">أقرب نقطة دالة</label>
          <input name="nearestLandmark" className={inputCls} />
          {state.fieldErrors?.nearestLandmark && (
            <span className="text-xs text-red-600">{state.fieldErrors.nearestLandmark}</span>
          )}
        </div>
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <label className="text-sm font-medium">
            ملاحظة <span className="text-zinc-400">(اختياري)</span>
          </label>
          <textarea name="note" rows={3} className={inputCls} />
          {state.fieldErrors?.note && (
            <span className="text-xs text-red-600">{state.fieldErrors.note}</span>
          )}
        </div>
      </div>

      <SubmitButton />
    </form>
  );
}
