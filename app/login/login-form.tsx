"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { loginAction, type AuthState } from "@/server/actions/auth";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-60"
    >
      {pending ? "جارٍ الدخول..." : "تسجيل الدخول"}
    </button>
  );
}

export function LoginForm({ next }: { next?: string }) {
  const [state, formAction] = useActionState<AuthState, FormData>(loginAction, {});

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {next && <input type="hidden" name="next" value={next} />}
      {state.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
          {state.error}
        </p>
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="identifier" className="text-sm font-medium">
          رقم الهاتف أو اسم المستخدم
        </label>
        <input
          id="identifier"
          name="identifier"
          type="text"
          autoComplete="username"
          placeholder="رقم الهاتف (أو اسم المستخدم للمشترك)"
          className="rounded-lg border border-black/10 bg-transparent px-3 py-2 outline-none focus:border-indigo-500 dark:border-white/15"
        />
        {state.fieldErrors?.identifier && (
          <span className="text-xs text-red-600">{state.fieldErrors.identifier}</span>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="secret" className="text-sm font-medium">
          كلمة المرور
        </label>
        <input
          id="secret"
          name="secret"
          type="password"
          autoComplete="current-password"
          placeholder="كلمة المرور (أو اسمك الكامل إن سجّلت قديماً بدونها)"
          className="rounded-lg border border-black/10 bg-transparent px-3 py-2 outline-none focus:border-indigo-500 dark:border-white/15"
        />
        {state.fieldErrors?.secret && (
          <span className="text-xs text-red-600">{state.fieldErrors.secret}</span>
        )}
      </div>

      <SubmitButton />

      <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
        لا تملك حساباً؟{" "}
        <Link href="/register" className="font-medium text-indigo-600 hover:underline">
          أنشئ حساباً جديداً
        </Link>
      </p>
    </form>
  );
}
