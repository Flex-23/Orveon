"use client";

// زر حذف مشترك — يطلب تأكيداً (نعم/لا عبر confirmToast) قبل التنفيذ لأن الحذف نهائي.
import { Trash2 } from "lucide-react";
import { deleteSubscriberAction } from "@/server/actions/manager";
import { ConfirmDeleteForm } from "./confirm-delete-form";

export function DeleteSubscriberButton({
  userId,
  name,
}: {
  userId: number;
  name: string;
}) {
  return (
    <ConfirmDeleteForm
      action={deleteSubscriberAction}
      fields={{ userId }}
      message={`حذف المشترك «${name}» نهائياً؟`}
      description="تُحذف اشتراكاته وبرامجه معه — لا يمكن التراجع."
      successMessage="تم حذف المشترك."
    >
      <button
        type="submit"
        aria-label="حذف المشترك"
        title="حذف المشترك"
        className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-600/10 text-red-600 transition-all hover:scale-110 hover:bg-red-600 hover:text-white hover:shadow-md hover:shadow-red-600/30 active:scale-95 dark:text-red-400"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </ConfirmDeleteForm>
  );
}
