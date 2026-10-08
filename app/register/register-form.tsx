"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { registerAction, type AuthState } from "@/server/actions/auth";
import { GOVERNORATES } from "@/lib/validations/auth";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-60"
    >
      {pending ? "جارٍ الإنشاء..." : "إنشاء حساب"}
    </button>
  );
}

export function RegisterForm() {
  const [state, formAction] = useActionState<AuthState, FormData>(registerAction, {});

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
          {state.error}
        </p>
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="name" className="text-sm font-medium">
          الاسم الكامل
        </label>
        <input
          id="name"
          name="name"
          type="text"
          className="rounded-lg border border-black/10 bg-transparent px-3 py-2 outline-none focus:border-indigo-500 dark:border-white/15"
        />
        {state.fieldErrors?.name && (
          <span className="text-xs text-red-600">{state.fieldErrors.name}</span>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="phone" className="text-sm font-medium">
          رقم الهاتف
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          inputMode="tel"
          className="rounded-lg border border-black/10 bg-transparent px-3 py-2 outline-none focus:border-indigo-500 dark:border-white/15"
        />
        {state.fieldErrors?.phone && (
          <span className="text-xs text-red-600">{state.fieldErrors.phone}</span>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="governorate" className="text-sm font-medium">
          المحافظة
        </label>
        <select
          id="governorate"
          name="governorate"
          defaultValue=""
          className="rounded-lg border border-black/10 bg-transparent px-3 py-2 outline-none focus:border-indigo-500 dark:border-white/15 dark:[&>option]:bg-zinc-900"
        >
          <option value="" disabled>
            اختر المحافظة
          </option>
          {GOVERNORATES.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
        {state.fieldErrors?.governorate && (
          <span className="text-xs text-red-600">{state.fieldErrors.governorate}</span>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-medium">
          كلمة المرور
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="8 أحرف على الأقل — تستخدمها عند تسجيل الدخول"
          className="rounded-lg border border-black/10 bg-transparent px-3 py-2 outline-none focus:border-indigo-500 dark:border-white/15"
        />
        {state.fieldErrors?.password && (
          <span className="text-xs text-red-600">{state.fieldErrors.password}</span>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="passwordConfirm" className="text-sm font-medium">
          تأكيد كلمة المرور
        </label>
        <input
          id="passwordConfirm"
          name="passwordConfirm"
          type="password"
          autoComplete="new-password"
          className="rounded-lg border border-black/10 bg-transparent px-3 py-2 outline-none focus:border-indigo-500 dark:border-white/15"
        />
        {state.fieldErrors?.passwordConfirm && (
          <span className="text-xs text-red-600">{state.fieldErrors.passwordConfirm}</span>
        )}
      </div>

      <SubmitButton />

      <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
        لديك حساب بالفعل؟{" "}
        <Link href="/login" className="font-medium text-indigo-600 hover:underline">
          تسجيل الدخول
        </Link>
      </p>
    </form>
  );
}
