"use client";

// نموذج تعديل مشترك — صفحة مستقلّة للعنصر (لا تعديل ضمني داخل صفحة التفاصيل).
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Check, CheckCircle2 } from "lucide-react";
import {
  updateSubscriberAction,
  type ManagerActionState,
} from "@/server/actions/manager";
import { GOVERNORATES } from "@/lib/validations/auth";
import { PaymentFields } from "@/components/dashboard/payment-fields";

export type SubscriberEditData = {
  id: number;
  name: string;
  phone: string;
  governorate: string | null;
  serviceName: string;
  endDate: string | null; // بصيغة YYYY-MM-DD للحقل، أو null
  totalAmount: number;
  paidAmount: number;
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

export function SubscriberEditForm({
  subscriber,
}: {
  subscriber: SubscriberEditData;
}) {
  const [state, action] = useActionState<ManagerActionState, FormData>(
    updateSubscriberAction,
    {},
  );
  const [governorate, setGovernorate] = useState(subscriber.governorate ?? "");

  return (
    <section className="rounded-2xl border border-line bg-panel p-6 shadow-sm">
      <form action={action} className="flex flex-col gap-4">
        <input type="hidden" name="userId" value={subscriber.id} />

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

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            الاسم
            <input name="name" defaultValue={subscriber.name} className={inputCls} />
            {state.fieldErrors?.name && (
              <span className="text-xs text-red-600">{state.fieldErrors.name}</span>
            )}
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            رقم الهاتف
            <input
              name="phone"
              type="tel"
              defaultValue={subscriber.phone}
              className={inputCls}
            />
            {state.fieldErrors?.phone && (
              <span className="text-xs text-red-600">{state.fieldErrors.phone}</span>
            )}
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            نوع الخدمة
            <input
              name="serviceName"
              defaultValue={subscriber.serviceName}
              className={inputCls}
            />
            {state.fieldErrors?.serviceName && (
              <span className="text-xs text-red-600">{state.fieldErrors.serviceName}</span>
            )}
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            المحافظة
            <select
              name="governorate"
              value={governorate}
              onChange={(e) => setGovernorate(e.target.value)}
              className={`${inputCls} dark:[&>option]:bg-zinc-900`}
            >
              <option value="">— غير محدّدة —</option>
              {GOVERNORATES.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            تاريخ انتهاء الاشتراك <span className="text-muted">(اختياري)</span>
            <input
              name="endDate"
              type="date"
              defaultValue={subscriber.endDate ?? ""}
              className={inputCls}
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            كلمة مرور جديدة <span className="text-muted">(اختياري)</span>
            <input
              name="code"
              type="text"
              placeholder="اتركه فارغاً للإبقاء على كلمة المرور الحالية"
              className={inputCls}
            />
            {state.fieldErrors?.code && (
              <span className="text-xs text-red-600">{state.fieldErrors.code}</span>
            )}
          </label>

          <PaymentFields
            totalDefault={subscriber.totalAmount}
            paidDefault={subscriber.paidAmount}
            inputCls={inputCls}
          />
          {state.fieldErrors?.paidAmount && (
            <span className="-mt-2 text-xs text-red-600 sm:col-span-2">
              {state.fieldErrors.paidAmount}
            </span>
          )}
        </div>

        <p className="-mt-1 text-xs text-muted">
          إفراغ حقل تاريخ الانتهاء يزيل التاريخ المحفوظ. المبلغ الباقي يُحسب تلقائياً.
        </p>

        <div className="pt-1">
          <SaveButton />
        </div>
      </form>
    </section>
  );
}
