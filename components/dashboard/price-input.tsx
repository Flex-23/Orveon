"use client";

// حقل إدخال السعر — يعرض فواصل الآلاف بأرقام إنجليزية أثناء الكتابة،
// ويُرسل القيمة الخام (أرقام فقط) عبر حقل مخفي للخادم.
import { useState } from "react";

function groupDigits(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  return Number(digits).toLocaleString("en-US");
}

export function PriceInput({
  name,
  defaultValue,
  className,
  placeholder,
}: {
  name: string;
  defaultValue?: number | string | null;
  className?: string;
  placeholder?: string;
}) {
  const initial =
    defaultValue != null && defaultValue !== ""
      ? groupDigits(String(Math.trunc(Number(defaultValue))))
      : "";
  const [display, setDisplay] = useState(initial);
  const raw = display.replace(/,/g, "");

  return (
    <>
      <input
        type="text"
        inputMode="numeric"
        dir="ltr"
        value={display}
        onChange={(e) => setDisplay(groupDigits(e.target.value))}
        placeholder={placeholder}
        className={`${className} text-right`}
      />
      <input type="hidden" name={name} value={raw} />
    </>
  );
}
