"use client";

// بطاقة كلمة المرور في تفاصيل الأدمن — مخفية افتراضياً وتُكشف/تُنسخ بزر.
// تصل القيمة من صفحة خادم مقصورة على المدير (requireManager) بعد فك التشفير.
import { useState } from "react";
import { KeyRound, Eye, EyeOff, Copy, Check } from "lucide-react";

const btnCls =
  "flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 text-accent-strong transition-all hover:scale-110 hover:bg-accent-strong hover:text-(--accent-contrast) active:scale-95";

export function PasswordRevealTile({ password }: { password: string | null }) {
  const [show, setShow] = useState(false);
  const [copied, setCopied] = useState(false);

  async function copy() {
    if (!password) return;
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // بيئة بلا صلاحية حافظة — تجاهُل صامت، الإظهار اليدوي متاح.
    }
  }

  return (
    <div className="rounded-2xl border border-line bg-panel p-4 shadow-sm transition-colors hover:border-accent/30">
      <div className="flex items-center gap-2 text-xs font-medium text-muted">
        <KeyRound className="h-4 w-4 text-accent-strong" />
        كلمة المرور
      </div>
      {password ? (
        <div className="mt-2 flex items-center gap-2">
          <span className="tabular min-w-0 truncate font-semibold" dir="ltr">
            {show ? password : "••••••••"}
          </span>
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            aria-label={show ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
            title={show ? "إخفاء" : "إظهار"}
            className={btnCls}
          >
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={copy}
            aria-label="نسخ كلمة المرور"
            title="نسخ"
            className={btnCls}
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>
      ) : (
        <p className="mt-2 text-sm text-muted">
          غير متوفرة لهذا الحساب — عيّن كلمة مرور جديدة من نموذج التعديل أدناه لتظهر هنا.
        </p>
      )}
    </div>
  );
}
