"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Truck } from "lucide-react";
import { placeOrderAction, type CheckoutState } from "@/server/actions/orders";
import { GOVERNORATES } from "@/lib/validations/auth";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-60"
    >
      {pending ? "جارٍ تنفيذ الطلب..." : "تأكيد الطلب"}
    </button>
  );
}

const inputCls =
  "w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 outline-none focus:border-indigo-500 dark:border-white/15";

type Props = {
  /** بيانات الزبون المسجّلة — تُملأ تلقائياً ويمكن تعديلها. */
  defaultName?: string;
  defaultPhone?: string;
  defaultGovernorate?: string;
};

export function CheckoutForm({
  defaultName = "",
  defaultPhone = "",
  defaultGovernorate = "",
}: Props) {
  const [state, formAction] = useActionState<CheckoutState, FormData>(
    placeOrderAction,
    {},
  );

  // المحافظة المسجّلة تُختار مسبقاً فقط إن كانت ضمن القائمة المعتمدة.
  const presetGovernorate = GOVERNORATES.includes(
    defaultGovernorate as (typeof GOVERNORATES)[number],
  )
    ? defaultGovernorate
    : "";

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {state.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
          {state.error}
        </p>
      )}

      {/* الدفع عند الاستلام فقط */}
      <input type="hidden" name="paymentMethod" value="cash_on_delivery" />
      <div className="flex items-center gap-3 rounded-xl border border-indigo-600 bg-indigo-50 p-4 dark:bg-indigo-950/30">
        <Truck className="h-5 w-5 text-indigo-600" />
        <span className="font-medium">توصيل (الدفع عند الاستلام)</span>
      </div>

      {/* حقول التوصيل */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">الاسم</label>
          <input name="deliveryName" defaultValue={defaultName} className={inputCls} />
          {state.fieldErrors?.deliveryName && (
            <span className="text-xs text-red-600">{state.fieldErrors.deliveryName}</span>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">رقم الهاتف</label>
          <input
            name="deliveryPhone"
            type="tel"
            defaultValue={defaultPhone}
            className={inputCls}
          />
          {state.fieldErrors?.deliveryPhone && (
            <span className="text-xs text-red-600">{state.fieldErrors.deliveryPhone}</span>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">المحافظة</label>
          <select
            name="governorate"
            defaultValue={presetGovernorate}
            className={`${inputCls} dark:[&>option]:bg-zinc-900`}
          >
            <option value="" disabled>اختر المحافظة</option>
            {GOVERNORATES.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
          {state.fieldErrors?.governorate && (
            <span className="text-xs text-red-600">{state.fieldErrors.governorate}</span>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">العنوان</label>
          <input name="address" className={inputCls} />
          {state.fieldErrors?.address && (
            <span className="text-xs text-red-600">{state.fieldErrors.address}</span>
          )}
        </div>
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <label className="text-sm font-medium">أقرب نقطة دالة</label>
          <input name="nearestLandmark" className={inputCls} />
          {state.fieldErrors?.nearestLandmark && (
            <span className="text-xs text-red-600">{state.fieldErrors.nearestLandmark}</span>
          )}
        </div>
      </div>

      <SubmitButton />
    </form>
  );
}
