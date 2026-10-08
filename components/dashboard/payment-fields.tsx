"use client";

// حقول مستحقات الدفع للمشترك: المبلغ الكلي + المبلغ الواصل + الباقي (محسوب مباشرةً).
// يُرسل القيم الخام (أرقام فقط) للخادم عبر حقول مخفية، والباقي للعرض فقط.
import { useState } from "react";

function groupDigits(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  return Number(digits).toLocaleString("en-US");
}

function initial(value?: number | string | null): string {
  return value != null && value !== ""
    ? groupDigits(String(Math.trunc(Number(value))))
    : "";
}

export function PaymentFields({
  totalDefault,
  paidDefault,
  inputCls,
}: {
  totalDefault?: number | string | null;
  paidDefault?: number | string | null;
  inputCls: string;
}) {
  const [total, setTotal] = useState(() => initial(totalDefault));
  const [paid, setPaid] = useState(() => initial(paidDefault));

  const totalRaw = total.replace(/,/g, "");
  const paidRaw = paid.replace(/,/g, "");
  const totalNum = Number(totalRaw) || 0;
  const paidNum = Number(paidRaw) || 0;
  const overpaid = paidNum > totalNum;
  const remaining = Math.max(0, totalNum - paidNum);
  const remainingDisplay = remaining.toLocaleString("en-US");

  return (
    <>
      <label className="flex flex-col gap-1.5 text-sm font-medium">
        المبلغ الكلي <span className="text-muted">(د.ع)</span>
        <input
          type="text"
          inputMode="numeric"
          dir="ltr"
          value={total}
          onChange={(e) => setTotal(groupDigits(e.target.value))}
          placeholder="0"
          className={`${inputCls} text-right`}
        />
        <input type="hidden" name="totalAmount" value={totalRaw} />
      </label>

      <label className="flex flex-col gap-1.5 text-sm font-medium">
        المبلغ الواصل <span className="text-muted">(د.ع)</span>
        <input
          type="text"
          inputMode="numeric"
          dir="ltr"
          value={paid}
          onChange={(e) => setPaid(groupDigits(e.target.value))}
          placeholder="0"
          aria-invalid={overpaid}
          className={`${inputCls} text-right ${overpaid ? "border-red-500 focus:border-red-500" : ""}`}
        />
        <input type="hidden" name="paidAmount" value={paidRaw} />
        {overpaid && (
          <span className="text-xs text-red-600">
            المبلغ الواصل أكبر من المبلغ الكلي
          </span>
        )}
      </label>

      <label className="flex flex-col gap-1.5 text-sm font-medium">
        المبلغ الباقي <span className="text-muted">(محسوب)</span>
        <input
          type="text"
          dir="ltr"
          value={remainingDisplay}
          readOnly
          tabIndex={-1}
          className={`${inputCls} cursor-default bg-black/5 text-right font-bold dark:bg-white/5 ${
            remaining > 0 ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"
          }`}
        />
      </label>
    </>
  );
}
