"use client";

// عرض موحّد لمستحقات المشترك كصفوف متطابقة:
// - الاشتراك الأساسي (الخدمة الأصلية) كصفّ.
// - كل مبلغ إضافي مستقلّ كصفّ.
// كل صفّ: العنوان + المدفوع/الكلي + شارة الباقي + تسديد كامل/نصفي (والحذف للإضافي فقط).
import { useState, useTransition } from "react";
import { Coins, Plus, Trash2, Wallet, X } from "lucide-react";
import { toast } from "sonner";
import { confirmToast } from "@/components/ui/confirm-toast";
import {
  addExtraChargeAction,
  deleteExtraChargeAction,
  payExtraChargeFullAction,
  payExtraChargePartialAction,
  paySubscriptionFullAction,
  paySubscriptionPartialAction,
} from "@/server/actions/manager";

const fmt = (n: number) => n.toLocaleString("en-US");
function groupDigits(raw: string): string {
  const d = raw.replace(/\D/g, "");
  return d ? Number(d).toLocaleString("en-US") : "";
}

type Row = {
  key: string;
  title: string;
  amount: number;
  paid: number;
} & (
  | { kind: "subscription"; subscriptionId: number }
  | { kind: "extra"; chargeId: number }
);

export function MemberDues({
  userId,
  subscription,
  extras,
}: {
  userId: number;
  subscription: { id: number; title: string; amount: number; paid: number } | null;
  extras: { id: number; label: string; amount: number; paid: number }[];
}) {
  const rows: Row[] = [];
  if (subscription)
    rows.push({
      key: `sub-${subscription.id}`,
      kind: "subscription",
      subscriptionId: subscription.id,
      title: subscription.title,
      amount: subscription.amount,
      paid: subscription.paid,
    });
  for (const e of extras)
    rows.push({
      key: `extra-${e.id}`,
      kind: "extra",
      chargeId: e.id,
      title: e.label,
      amount: e.amount,
      paid: e.paid,
    });

  return (
    <div className="flex flex-col gap-2">
      {rows.map((r) => (
        <DuesRow key={r.key} userId={userId} row={r} />
      ))}
      <AddChargeForm userId={userId} />
    </div>
  );
}

function DuesRow({ userId, row }: { userId: number; row: Row }) {
  const [open, setOpen] = useState(false);
  const [received, setReceived] = useState("");
  const [pending, startTransition] = useTransition();

  const remaining = Math.max(0, row.amount - row.paid);
  const settled = remaining <= 0;
  const receivedRaw = received.replace(/\D/g, "");
  const isPrimary = row.kind === "subscription";

  function payFull() {
    confirmToast({
      message: `تسديد كامل «${row.title}»؟`,
      description: `المتبقّي ${fmt(remaining)} د.ع راح يتصفّر.`,
      confirmLabel: "نعم",
      cancelLabel: "لا",
      tone: "emerald",
      onConfirm: () =>
        startTransition(async () => {
          const fd = new FormData();
          fd.set("userId", String(userId));
          if (row.kind === "subscription") {
            fd.set("subscriptionId", String(row.subscriptionId));
            await paySubscriptionFullAction(fd);
          } else {
            fd.set("chargeId", String(row.chargeId));
            await payExtraChargeFullAction(fd);
          }
          toast.success("تم تسديد المبلغ بالكامل.");
        }),
    });
  }

  function payPartial() {
    const amt = Number(receivedRaw) || 0;
    if (amt <= 0) {
      toast.error("أدخل مبلغاً صحيحاً أكبر من صفر.");
      return;
    }
    startTransition(async () => {
      const fd = new FormData();
      fd.set("userId", String(userId));
      fd.set("received", String(amt));
      let res;
      if (row.kind === "subscription") {
        fd.set("subscriptionId", String(row.subscriptionId));
        res = await paySubscriptionPartialAction({}, fd);
      } else {
        fd.set("chargeId", String(row.chargeId));
        res = await payExtraChargePartialAction({}, fd);
      }
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

  function removeRow() {
    if (row.kind !== "extra") return;
    const chargeId = row.chargeId;
    confirmToast({
      message: `حذف «${row.title}»؟`,
      confirmLabel: "حذف",
      cancelLabel: "إلغاء",
      tone: "red",
      onConfirm: () =>
        startTransition(async () => {
          const fd = new FormData();
          fd.set("chargeId", String(chargeId));
          fd.set("userId", String(userId));
          await deleteExtraChargeAction(fd);
          toast.success("تم حذف المبلغ.");
        }),
    });
  }

  return (
    <div className="rounded-xl border border-line bg-background p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="flex items-center gap-2 truncate text-sm font-semibold">
            {row.title}
            {isPrimary && (
              <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-bold text-accent-strong">
                أساسي
              </span>
            )}
          </p>
          <p className="tabular text-xs text-muted" dir="ltr">
            {fmt(row.paid)} / {fmt(row.amount)} د.ع
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`tabular rounded-full px-2.5 py-1 text-xs font-bold ${
              settled
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
                : "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300"
            }`}
            dir="ltr"
          >
            {settled ? "مدفوع" : `باقٍ ${fmt(remaining)}`}
          </span>
          {!settled && (
            <>
              <button
                type="button"
                onClick={payFull}
                disabled={pending}
                title="تسديد كامل"
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600/10 text-emerald-600 transition-colors hover:bg-emerald-600 hover:text-white disabled:opacity-60 dark:text-emerald-400"
              >
                <Wallet className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                title="تسديد نصفي"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-line text-accent-strong transition-colors hover:bg-accent/10"
              >
                <Coins className="h-4 w-4" />
              </button>
            </>
          )}
          {!isPrimary && (
            <button
              type="button"
              onClick={removeRow}
              disabled={pending}
              aria-label="حذف"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-red-500 transition-colors hover:bg-red-500/10 disabled:opacity-60"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {open && !settled && (
        <div className="mt-2 flex items-center gap-2">
          <input
            value={received}
            onChange={(e) => setReceived(groupDigits(e.target.value))}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                payPartial();
              }
            }}
            inputMode="numeric"
            dir="ltr"
            autoFocus
            placeholder="المبلغ المستلم"
            className="w-36 rounded-lg border border-line bg-background px-3 py-2 text-right text-sm outline-none transition-colors focus:border-accent"
          />
          <button
            type="button"
            onClick={payPartial}
            disabled={pending}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-(--accent-contrast) transition-colors hover:bg-accent-strong disabled:opacity-60"
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
      )}
    </div>
  );
}

function AddChargeForm({ userId }: { userId: number }) {
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState("");
  const [pending, startTransition] = useTransition();

  const amountRaw = amount.replace(/\D/g, "");

  function addCharge() {
    const amt = Number(amountRaw) || 0;
    if (label.trim().length < 2) {
      toast.error("أدخل عنواناً للمبلغ.");
      return;
    }
    if (amt <= 0) {
      toast.error("أدخل مبلغاً صحيحاً أكبر من صفر.");
      return;
    }
    startTransition(async () => {
      const fd = new FormData();
      fd.set("userId", String(userId));
      fd.set("label", label.trim());
      fd.set("amount", String(amt));
      const res = await addExtraChargeAction({}, fd);
      if (res.error) {
        toast.error(res.error);
      } else if (res.fieldErrors) {
        toast.error(Object.values(res.fieldErrors)[0]);
      } else if (res.success) {
        toast.success(res.success);
        setLabel("");
        setAmount("");
      }
    });
  }

  return (
    <div className="mt-2 flex flex-wrap items-end gap-2 rounded-xl border border-dashed border-line p-3">
      <label className="flex flex-1 flex-col gap-1 text-xs font-medium">
        عنوان مبلغ جديد (تحديث خدمة / نظام آخر)
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="مثلاً: تحديث النظام"
          className="rounded-lg border border-line bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-accent"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs font-medium">
        المبلغ (د.ع)
        <input
          value={amount}
          onChange={(e) => setAmount(groupDigits(e.target.value))}
          inputMode="numeric"
          dir="ltr"
          placeholder="0"
          className="w-32 rounded-lg border border-line bg-background px-3 py-2 text-right text-sm outline-none transition-colors focus:border-accent"
        />
      </label>
      <button
        type="button"
        onClick={addCharge}
        disabled={pending}
        className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-(--accent-contrast) transition-colors hover:bg-accent-strong disabled:opacity-60"
      >
        <Plus className="h-4 w-4" />
        إضافة
      </button>
    </div>
  );
}
