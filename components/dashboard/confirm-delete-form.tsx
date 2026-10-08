"use client";

// نموذج حذف موحّد بتأكيد نعم/لا (confirmToast) — يغلّف زر الحذف كما هو،
// ويعترض الإرسال ليعرض التأكيد أولاً، ثم ينفّذ إجراء الحذف ويُظهر toast نجاح.
// يعمل من مكونات الخادم أيضاً (تمرير إجراء خادم كخاصية مسموح).
import { useTransition, type FormEvent, type ReactNode } from "react";
import { toast } from "sonner";
import { confirmToast } from "@/components/ui/confirm-toast";

export function ConfirmDeleteForm({
  action,
  fields,
  message,
  description = "لا يمكن التراجع بعد الحذف.",
  successMessage,
  className,
  children,
}: {
  action: (formData: FormData) => void | Promise<void>;
  /** الحقول المرسلة للإجراء (المعرّفات) — بديل الحقول المخفية. */
  fields: Record<string, string | number>;
  message: string;
  description?: string;
  successMessage?: string;
  className?: string;
  /** زر الحذف بتنسيقه الأصلي (type="submit"). */
  children: ReactNode;
}) {
  const [pending, startTransition] = useTransition();

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    confirmToast({
      message,
      description,
      confirmLabel: "نعم",
      cancelLabel: "لا",
      tone: "red",
      onConfirm: () =>
        startTransition(async () => {
          const fd = new FormData();
          for (const [key, value] of Object.entries(fields)) {
            fd.set(key, String(value));
          }
          await action(fd);
          if (successMessage) toast.success(successMessage);
        }),
    });
  }

  return (
    <form onSubmit={onSubmit} className={className}>
      <fieldset disabled={pending} className="contents">
        {children}
      </fieldset>
    </form>
  );
}
