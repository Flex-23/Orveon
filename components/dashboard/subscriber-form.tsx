"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { UserPlus, MessageCircle } from "lucide-react";
import {
  createSubscriberAction,
  type ManagerActionState,
} from "@/server/actions/manager";
import { GOVERNORATES } from "@/lib/validations/auth";
import { PaymentFields } from "@/components/dashboard/payment-fields";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex items-center gap-1 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-(--accent-contrast) transition-colors hover:bg-accent-strong disabled:opacity-60"
    >
      <UserPlus className="h-4 w-4" />
      {pending ? "جارٍ الإنشاء..." : "إنشاء مشترك"}
    </button>
  );
}

const inputCls =
  "w-full rounded-lg border border-line bg-background px-3 py-2 outline-none transition-colors focus:border-accent";

export function SubscriberForm() {
  const [state, action] = useActionState<ManagerActionState, FormData>(
    createSubscriberAction,
    {},
  );
  // محافظة مُتحكَّم بها: تبقى محفوظة بعد إعادة تعيين النموذج عند الخطأ (تكرار رقم مثلاً).
  const [governorate, setGovernorate] = useState(state.values?.governorate ?? "");

  return (
    <form action={action} className="flex flex-col gap-4">
      {state.success && (
        <div className="rounded-lg bg-emerald-50 px-3 py-3 text-sm text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
          <p>{state.success}</p>
          {state.credentials && (
            <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 rounded-md bg-emerald-100/60 px-3 py-2 font-medium dark:bg-emerald-900/40">
              <span dir="ltr">
                اسم المستخدم: <span className="tabular font-bold">{state.credentials.username}</span>
              </span>
              <span dir="ltr">
                كلمة المرور: <span className="font-bold">{state.credentials.password}</span>
              </span>
            </div>
          )}
          {state.whatsappLink && (
            <a
              href={state.whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 font-semibold text-white hover:bg-green-700"
            >
              <MessageCircle className="h-4 w-4" />
              إرسال بيانات الدخول عبر واتساب
            </a>
          )}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">الاسم</label>
          <input name="name" defaultValue={state.values?.name ?? ""} className={inputCls} />
          {state.fieldErrors?.name && (
            <span className="text-xs text-red-600">{state.fieldErrors.name}</span>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">رقم الهاتف</label>
          <input name="phone" type="tel" defaultValue={state.values?.phone ?? ""} className={inputCls} />
          {state.fieldErrors?.phone && (
            <span className="text-xs text-red-600">{state.fieldErrors.phone}</span>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">نوع الخدمة</label>
          <input
            name="serviceName"
            defaultValue={state.values?.serviceName ?? ""}
            placeholder="مثال: اشتراك متجر سنوي"
            className={inputCls}
          />
          {state.fieldErrors?.serviceName && (
            <span className="text-xs text-red-600">{state.fieldErrors.serviceName}</span>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">المحافظة</label>
          <select
            name="governorate"
            value={governorate}
            onChange={(e) => setGovernorate(e.target.value)}
            className={`${inputCls} dark:[&>option]:bg-zinc-900`}
          >
            <option value=""></option>
            {GOVERNORATES.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">كلمة المرور</label>
          <input name="code" type="text" defaultValue={state.values?.code ?? ""} className={inputCls} />
          {state.fieldErrors?.code && (
            <span className="text-xs text-red-600">{state.fieldErrors.code}</span>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">
            تاريخ انتهاء الاشتراك <span className="text-muted">(اختياري)</span>
          </label>
          <input name="endDate" type="date" defaultValue={state.values?.endDate ?? ""} className={inputCls} />
        </div>

        <PaymentFields
          totalDefault={state.values?.totalAmount}
          paidDefault={state.values?.paidAmount}
          inputCls={inputCls}
        />
        {state.fieldErrors?.paidAmount && (
          <span className="-mt-2 text-xs text-red-600 sm:col-span-2">
            {state.fieldErrors.paidAmount}
          </span>
        )}
      </div>

      <p className="-mt-1 text-xs text-muted">
        يُولَّد اسم المستخدم (أحرف وأرقام) تلقائياً عند الإنشاء، وكلمة المرور تحددها أنت.
      </p>

      <div>
        <Submit />
      </div>
    </form>
  );
}
