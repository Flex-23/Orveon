"use client";

// نموذج «ابدأ مشروعك»: بيانات الزبون تُملأ تلقائياً من تسجيله (قابلة للتعديل)
// + وصف المشروع والمدة المتوقعة — بدون أي ذكر للسعر.
import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { CheckCircle2, Send } from "lucide-react";
import { toast } from "sonner";
import { requestProjectAction, type ProjectState } from "@/server/actions/projects";
import { GOVERNORATES } from "@/lib/validations/auth";
import { PROJECT_DURATIONS } from "@/lib/validations/project";

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
  "rounded-lg border border-black/10 bg-transparent px-3 py-2 outline-none focus:border-indigo-500 dark:border-white/15";

type Props = {
  /** بيانات الزبون المسجّلة — تُملأ تلقائياً ويمكن تعديلها. */
  defaultName?: string;
  defaultPhone?: string;
  defaultGovernorate?: string;
};

export function ProjectRequestForm({
  defaultName = "",
  defaultPhone = "",
  defaultGovernorate = "",
}: Props) {
  const [state, formAction] = useActionState<ProjectState, FormData>(
    requestProjectAction,
    {},
  );

  useEffect(() => {
    if (state.success) {
      toast.success("تم إرسال طلب مشروعك بنجاح، سنتواصل معك قريباً.");
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state]);

  if (state.success) {
    return (
      <div className="flex flex-col items-center gap-4 py-6 text-center">
        <CheckCircle2 className="h-12 w-12 text-emerald-500" />
        <div>
          <p className="font-semibold">تم استلام طلبك بنجاح</p>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            سيراجع فريقنا التفاصيل ويتواصل معك — يمكنك متابعة حالة الطلب من
            الصفحة الرئيسية.
          </p>
        </div>
        <Link
          href="/"
          className="rounded-xl bg-accent-strong px-6 py-2.5 font-semibold text-(--accent-contrast) transition-colors hover:opacity-90"
        >
          العودة للصفحة الرئيسية
        </Link>
      </div>
    );
  }

  const presetGovernorate = GOVERNORATES.includes(
    defaultGovernorate as (typeof GOVERNORATES)[number],
  )
    ? defaultGovernorate
    : "";

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
          {state.error}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="name" className="text-sm font-medium">
            الاسم
          </label>
          <input id="name" name="name" defaultValue={defaultName} className={inputCls} />
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
            defaultValue={defaultPhone}
            className={inputCls}
          />
          {state.fieldErrors?.phone && (
            <span className="text-xs text-red-600">{state.fieldErrors.phone}</span>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="governorate" className="text-sm font-medium">
          المحافظة
        </label>
        <select
          id="governorate"
          name="governorate"
          defaultValue={presetGovernorate}
          className={`${inputCls} dark:[&>option]:bg-zinc-900`}
        >
          <option value="">اختر المحافظة</option>
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
        <label htmlFor="description" className="text-sm font-medium">
          وصف المشروع
        </label>
        <textarea
          id="description"
          name="description"
          rows={5}
          placeholder="صف فكرتك: ما المشكلة التي يحلها المشروع؟ ما الميزات الأساسية التي تريدها؟"
          className={inputCls}
        />
        {state.fieldErrors?.description && (
          <span className="text-xs text-red-600">{state.fieldErrors.description}</span>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="duration" className="text-sm font-medium">
          المدة المتوقعة
        </label>
        <select
          id="duration"
          name="duration"
          defaultValue=""
          className={`${inputCls} dark:[&>option]:bg-zinc-900`}
        >
          <option value="" disabled>
            حدّد المدة
          </option>
          {PROJECT_DURATIONS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
        {state.fieldErrors?.duration && (
          <span className="text-xs text-red-600">{state.fieldErrors.duration}</span>
        )}
      </div>

      <SubmitButton />
    </form>
  );
}
