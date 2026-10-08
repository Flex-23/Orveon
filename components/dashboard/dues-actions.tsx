"use client";

// أزرار تسديد المستحقات داخل قائمة المستحقات:
// - «تسديد كامل»: يطلب تأكيداً عبر sonner ثم يصفّر المتبقّي (الواصل = الكلي).
// - «تسديد نصفي»: فورم صغير لإدخال المبلغ المستلم، والنظام يحسب الباقي ويحدّثه.
// كل التأكيدات والتنبيهات تمرّ عبر sonner (toast).
import { useState, useTransition } from "react";
import { Coins, Wallet, X } from "lucide-react";
import { toast } from "sonner";
import { confirmToast } from "@/components/ui/confirm-toast";
import {
  payDuesFullAction,
  payDuesPartialAction,
} from "@/server/actions/manager";

function groupDigits(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  return digits ? Number(digits).toLocaleString("en-US") : "";
}

export function DuesActions({
  userId,
  remaining,
}: {
  userId: number;
  remaining: number;
}) {
  const [open, setOpen] = useState(false);
  const [received, setReceived] = useState("");
  const [pending, startTransition] = useTransition();

  const receivedRaw = received.replace(/\D/g, "");

  // تسديد كامل — تأكيد (نعم/لا) عبر toast مخصّص ثم تنفيذ.
  function payFull() {
    confirmToast({
      message: "تسديد كامل المبلغ المتبقّي؟",
      description: "راح يتصفّر المتبقّي من حساب الزبون.",
      confirmLabel: "نعم",
      cancelLabel: "لا",
      tone: "emerald",
      onConfirm: () =>
        startTransition(async () => {
          const fd = new FormData();
          fd.set("userId", String(userId));
          await payDuesFullAction(fd);
          toast.success("تم تسديد كامل المبلغ — لا يوجد متبقٍّ.");
        }),
    });
  }

  // تسديد نصفي — يضيف المستلم ويعيد حساب الباقي.
  function payPartial() {
    const amount = Number(receivedRaw) || 0;
    if (amount <= 0) {
      toast.error("أدخل مبلغاً صحيحاً أكبر من صفر.");
      return;
    }
    startTransition(async () => {
      const fd = new FormData();
      fd.set("userId", String(userId));
      fd.set("received", String(amount));
      const res = await payDuesPartialAction({}, fd);
      if (res.error) {
        toast.error(res.error);
      } else if (res.fieldErrors?.received) {
        toast.error(res.fieldErrors.received);
      } else if (res.success) {
        toast.success(res.success);
        setOpen(false);
        setReceived("");
      }
    });
  }

  return (
    <div className="flex flex-col items-stretch gap-2 sm:items-end">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={payFull}
          disabled={pending}
          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-60"
        >
          <Wallet className="h-3.5 w-3.5" />
          تسديد كامل
        </button>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-2 text-sm font-semibold text-accent-strong transition-colors hover:bg-accent/10"
        >
          <Coins className="h-3.5 w-3.5" />
          تسديد نصفي
        </button>
      </div>

      {open && (
        <div className="flex flex-col gap-1.5 rounded-xl border border-line bg-background p-2.5">
          <div className="flex items-center gap-2">
            <input
              type="text"
              inputMode="numeric"
              dir="ltr"
              autoFocus
              value={received}
              onChange={(e) => setReceived(groupDigits(e.target.value))}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  payPartial();
                }
              }}
              placeholder="المبلغ المستلم"
              className="w-36 rounded-lg border border-line bg-background px-3 py-2 text-right text-sm outline-none transition-colors focus:border-accent"
            />
            <button
              type="button"
              onClick={payPartial}
              disabled={pending}
              className="inline-flex items-center justify-center rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-(--accent-contrast) transition-colors hover:bg-accent-strong disabled:opacity-60"
            >
              تأكيد
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="إلغاء"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-black/5 dark:hover:bg-white/10"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <span className="text-xs text-muted">
            المتبقّي حالياً:{" "}
            <span className="tabular font-semibold" dir="ltr">
              {remaining.toLocaleString("en-US")}
            </span>{" "}
            د.ع
          </span>
        </div>
      )}
    </div>
  );
}
