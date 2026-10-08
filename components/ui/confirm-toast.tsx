"use client";

// تأكيد (نعم/لا) عبر toast مخصّص بأزرار حيوية وأنيقة.
import { toast } from "sonner";
import { Check, HelpCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Tone = "emerald" | "indigo" | "red";

type ConfirmToastOptions = {
  message: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  tone?: Tone;
};

const TONES: Record<Tone, { badge: string; confirm: string }> = {
  emerald: {
    badge: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    confirm:
      "from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 shadow-emerald-500/30",
  },
  indigo: {
    badge: "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400",
    confirm:
      "from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 shadow-indigo-500/30",
  },
  red: {
    badge: "bg-red-500/15 text-red-600 dark:text-red-400",
    confirm:
      "from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 shadow-red-500/30",
  },
};

export function confirmToast({
  message,
  description,
  confirmLabel = "نعم",
  cancelLabel = "لا",
  onConfirm,
  tone = "indigo",
}: ConfirmToastOptions) {
  const t = TONES[tone];

  toast.custom(
    (id) => (
      <div className="flex w-full flex-col gap-3.5 rounded-2xl border border-border bg-popover p-4 text-popover-foreground shadow-2xl ring-1 ring-black/5 dark:ring-white/5">
        <div className="flex items-start gap-3">
          <span
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
              t.badge,
            )}
          >
            <HelpCircle className="h-5 w-5" />
          </span>
          <div className="min-w-0 pt-1">
            <p className="font-semibold leading-snug">{message}</p>
            {description && (
              <p className="mt-1 text-sm text-muted">{description}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => {
              toast.dismiss(id);
              onConfirm();
            }}
            className={cn(
              "group inline-flex items-center justify-center gap-1.5 rounded-xl bg-linear-to-br px-4 py-2.5 text-sm font-bold text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 active:scale-95",
              t.confirm,
            )}
          >
            <Check className="h-4 w-4 transition-transform group-hover:scale-110" />
            {confirmLabel}
          </button>
          <button
            type="button"
            onClick={() => toast.dismiss(id)}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-foreground/70 transition-all duration-200 hover:-translate-y-0.5 hover:border-foreground/25 hover:bg-foreground/5 hover:text-foreground active:translate-y-0 active:scale-95"
          >
            <X className="h-4 w-4" />
            {cancelLabel}
          </button>
        </div>
      </div>
    ),
    { duration: Infinity, unstyled: true },
  );
}
