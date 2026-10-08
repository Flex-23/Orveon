"use client";

// زر حذف أدمن — يطلب تأكيداً (نعم/لا عبر confirmToast) قبل التنفيذ لأن الحذف نهائي.
import { Trash2 } from "lucide-react";
import { deleteAdminAction } from "@/server/actions/manager";
import { ConfirmDeleteForm } from "./confirm-delete-form";

export function DeleteAdminButton({
  adminId,
  name,
  withLabel = false,
}: {
  adminId: number;
  name: string;
  withLabel?: boolean;
}) {
  return (
    <ConfirmDeleteForm
      action={deleteAdminAction}
      fields={{ adminId }}
      message={`حذف حساب الأدمن «${name}» نهائياً؟`}
      successMessage="تم حذف الأدمن."
    >
      {withLabel ? (
        <button
          type="submit"
          className="inline-flex items-center gap-1.5 rounded-lg bg-red-600/10 px-3.5 py-2 text-sm font-medium text-red-600 transition-all hover:bg-red-600 hover:text-white active:scale-95 dark:text-red-400"
        >
          <Trash2 className="h-4 w-4" />
          حذف الأدمن
        </button>
      ) : (
        <button
          type="submit"
          aria-label="حذف الأدمن"
          title="حذف الأدمن"
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-600/10 text-red-600 transition-all hover:scale-110 hover:bg-red-600 hover:text-white hover:shadow-md hover:shadow-red-600/30 active:scale-95 dark:text-red-400"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </ConfirmDeleteForm>
  );
}
