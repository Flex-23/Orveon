"use client";

// أزرار الكارد حسب الحالة: أضف للسلة / حجز / نافذ.
import Link from "next/link";
import { useFormStatus } from "react-dom";
import { ShoppingCart, CalendarClock, Ban } from "lucide-react";
import { addToCartAction } from "@/server/actions/cart";
import type { EffectiveStatus } from "@/lib/product-status";

function SubmitButton({
  label,
  pendingLabel,
  icon,
  variant = "primary",
}: {
  label: string;
  pendingLabel: string;
  icon: React.ReactNode;
  variant?: "primary" | "warn";
}) {
  const { pending } = useFormStatus();
  const base =
    "flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-60";
  const styles =
    variant === "primary"
      ? "bg-indigo-600 text-white hover:bg-indigo-700"
      : "bg-amber-500 text-white hover:bg-amber-600";
  return (
    <button type="submit" disabled={pending} className={`${base} ${styles}`}>
      {icon}
      {pending ? pendingLabel : label}
    </button>
  );
}

export function ProductActions({
  productId,
  status,
}: {
  productId: number;
  status: EffectiveStatus;
}) {
  if (status === "out_of_stock") {
    return (
      <button
        disabled
        className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-lg bg-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500"
      >
        <Ban className="h-4 w-4" />
        نافذ
      </button>
    );
  }

  if (status === "coming_soon") {
    return (
      <Link
        href={`/store/reserve/${productId}`}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-amber-600"
      >
        <CalendarClock className="h-4 w-4" />
        حجز
      </Link>
    );
  }

  return (
    <form action={addToCartAction}>
      <input type="hidden" name="productId" value={productId} />
      <SubmitButton
        label="أضف للسلة"
        pendingLabel="جارٍ الإضافة..."
        icon={<ShoppingCart className="h-4 w-4" />}
      />
    </form>
  );
}
