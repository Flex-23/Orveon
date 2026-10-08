// منطق حالة المنتج المعروضة داخل الكارد (موجود / نافذ / قريباً).
import type { ProductStatus } from "@/lib/generated/prisma";

export type EffectiveStatus = "available" | "out_of_stock" | "coming_soon";

/**
 * الحالة الفعلية للعرض:
 * - "قريباً" تبقى كما هي.
 * - "موجود" تتحوّل تلقائياً إلى "نافذ" عند انتهاء الكمية.
 */
export function effectiveStatus(product: {
  status: ProductStatus;
  quantity: number;
}): EffectiveStatus {
  if (product.status === "coming_soon") return "coming_soon";
  if (product.status === "out_of_stock" || product.quantity <= 0) {
    return "out_of_stock";
  }
  return "available";
}

export const STATUS_LABELS: Record<EffectiveStatus, string> = {
  available: "موجود",
  out_of_stock: "نافذ",
  coming_soon: "قريباً",
};

export const STATUS_BADGE_CLASSES: Record<EffectiveStatus, string> = {
  available:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300",
  out_of_stock:
    "bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
  coming_soon:
    "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300",
};
