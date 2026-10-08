"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { UserPlus, MessageCircle } from "lucide-react";
import {
  createAdminAction,
  type ManagerActionState,
} from "@/server/actions/manager";
import { PERMISSION_LABELS, type Permission } from "@/lib/auth/permissions";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex items-center gap-1 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-(--accent-contrast) transition-colors hover:bg-accent-strong disabled:opacity-60"
    >
      <UserPlus className="h-4 w-4" />
      {pending ? "جارٍ الإنشاء..." : "إنشاء أدمن"}
    </button>
  );
}

const inputCls =
  "w-full rounded-lg border border-line bg-background px-3 py-2 outline-none transition-colors focus:border-accent";

export function AdminForm() {
  const [state, action] = useActionState<ManagerActionState, FormData>(
    createAdminAction,
    {},
  );

  return (
    <form action={action} className="flex flex-col gap-4">
      {state.success && (
        <div className="rounded-lg bg-emerald-50 px-3 py-3 text-sm text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
          <p>{state.success}</p>
          {state.credentials && (
            <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 rounded-md bg-emerald-100/60 px-3 py-2 font-medium dark:bg-emerald-900/40">
              <span dir="ltr">
                رقم الدخول: <span className="tabular font-bold">{state.credentials.username}</span>
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

      <div className="grid gap-4 sm:grid-cols-3">
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
          <label className="text-sm font-medium">كلمة المرور</label>
          <input name="password" type="text" defaultValue={state.values?.password ?? ""} className={inputCls} />
          {state.fieldErrors?.password && (
            <span className="text-xs text-red-600">{state.fieldErrors.password}</span>
          )}
        </div>
      </div>

      <fieldset>
        <legend className="mb-2 text-sm font-medium">الصلاحيات</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {(Object.keys(PERMISSION_LABELS) as Permission[]).map((key) => (
            <label
              key={key}
              className="flex cursor-pointer items-center gap-2 rounded-lg border border-line px-3 py-2 text-sm"
            >
              <input
                type="checkbox"
                name={key}
                defaultChecked={state.values?.[key] === "on"}
                className="h-4 w-4 accent-accent"
              />
              {PERMISSION_LABELS[key]}
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <Submit />
      </div>
    </form>
  );
}
