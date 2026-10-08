"use client";

// نموذج تعديل أدمن (الاسم/الرقم/كلمة المرور/الصلاحيات) — يظهر داخل صفحة تفاصيل الأدمن.
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Check, CheckCircle2, ShieldCheck } from "lucide-react";
import {
  updateAdminAction,
  type ManagerActionState,
} from "@/server/actions/manager";
import { PERMISSION_LABELS, type Permission } from "@/lib/auth/permissions";

export type AdminEditData = {
  id: number;
  name: string;
  phone: string;
  permissions: Record<Permission, boolean>;
};

const PERMS = Object.keys(PERMISSION_LABELS) as Permission[];

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

export function AdminEditForm({ admin }: { admin: AdminEditData }) {
  const [state, action] = useActionState<ManagerActionState, FormData>(
    updateAdminAction,
    {},
  );

  return (
    <section className="rounded-2xl border border-line bg-panel p-6 shadow-sm">
      <h2 className="mb-4 flex items-center gap-2 font-semibold">
        <ShieldCheck className="h-5 w-5 text-accent-strong" />
        البيانات والصلاحيات
      </h2>

      <form action={action} className="flex flex-col gap-4">
        <input type="hidden" name="adminId" value={admin.id} />

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

        <div className="grid gap-3 sm:grid-cols-3">
          <label className="flex flex-col gap-1 text-xs font-medium text-muted">
            الاسم
            <input name="name" defaultValue={admin.name} className={inputCls} />
            {state.fieldErrors?.name && (
              <span className="text-red-600">{state.fieldErrors.name}</span>
            )}
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-muted">
            رقم الهاتف
            <input name="phone" type="tel" defaultValue={admin.phone} className={inputCls} />
            {state.fieldErrors?.phone && (
              <span className="text-red-600">{state.fieldErrors.phone}</span>
            )}
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-muted">
            كلمة مرور جديدة (اختياري)
            <input
              name="password"
              type="text"
              placeholder="اتركه فارغاً للإبقاء"
              className={inputCls}
            />
            {state.fieldErrors?.password && (
              <span className="text-red-600">{state.fieldErrors.password}</span>
            )}
          </label>
        </div>

        <fieldset>
          <legend className="mb-2 text-xs font-medium text-muted">الصلاحيات</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {PERMS.map((key) => (
              <label
                key={key}
                className="flex cursor-pointer items-center gap-2 rounded-lg border border-line px-3 py-2 text-sm transition-colors hover:bg-foreground/5"
              >
                <input
                  type="checkbox"
                  name={key}
                  defaultChecked={admin.permissions[key]}
                  className="h-4 w-4 accent-accent"
                />
                {PERMISSION_LABELS[key]}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="pt-1">
          <SaveButton />
        </div>
      </form>
    </section>
  );
}
