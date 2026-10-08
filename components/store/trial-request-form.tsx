"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { requestTrialAction, type TrialState } from "@/server/actions/trials";
import { GOVERNORATES } from "@/lib/validations/auth";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent-strong px-6 py-3 font-semibold text-(--accent-contrast) transition-colors hover:opacity-90 disabled:opacity-60"
    >
      <Send className="h-4 w-4" />
      {pending ? "جارٍ الإرسال..." : "إرسال الطلب"}
    </button>
  );
}

const inputCls =
  "w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-white outline-none placeholder:text-white/40 focus:border-accent";

type Props = {
  workId: number;
  /** بيانات الزبون المسجّلة — تُملأ تلقائياً ويمكن تعديلها. */
  defaultName?: string;
  defaultPhone?: string;
  defaultGovernorate?: string;
  onSuccess?: () => void;
};

export function TrialRequestForm({
  workId,
  defaultName = "",
  defaultPhone = "",
  defaultGovernorate = "",
  onSuccess,
}: Props) {
  const [state, formAction] = useActionState<TrialState, FormData>(
    requestTrialAction,
    {},
  );

  useEffect(() => {
    if (state.success) {
      toast.success("تم إرسال طلبك بنجاح، سنتواصل معك قريباً.");
      onSuccess?.();
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state, onSuccess]);

  const presetGovernorate = GOVERNORATES.includes(
    defaultGovernorate as (typeof GOVERNORATES)[number],
  )
    ? defaultGovernorate
    : "";

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <input type="hidden" name="workId" value={workId} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-white/80">الاسم</label>
          <input name="name" defaultValue={defaultName} className={inputCls} />
          {state.fieldErrors?.name && (
            <span className="text-xs text-red-400">{state.fieldErrors.name}</span>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-white/80">رقم الهاتف</label>
          <input
            name="phone"
            type="tel"
            defaultValue={defaultPhone}
            className={inputCls}
          />
          {state.fieldErrors?.phone && (
            <span className="text-xs text-red-400">{state.fieldErrors.phone}</span>
          )}
        </div>
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <label className="text-sm font-medium text-white/80">المحافظة</label>
          <select
            name="governorate"
            defaultValue={presetGovernorate}
            className={`${inputCls} [&>option]:bg-zinc-900`}
          >
            <option value="">اختر المحافظة</option>
            {GOVERNORATES.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
          {state.fieldErrors?.governorate && (
            <span className="text-xs text-red-400">{state.fieldErrors.governorate}</span>
          )}
        </div>
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <label className="text-sm font-medium text-white/80">
            تفاصيل الطلب <span className="text-white/40">(اختياري)</span>
          </label>
          <textarea
            name="details"
            rows={3}
            placeholder="صف ما تريده في النسخة التجريبية..."
            className={inputCls}
          />
          {state.fieldErrors?.details && (
            <span className="text-xs text-red-400">{state.fieldErrors.details}</span>
          )}
        </div>
      </div>

      <SubmitButton />
    </form>
  );
}
