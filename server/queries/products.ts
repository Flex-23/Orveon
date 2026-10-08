// استعلامات المتجر (المنتجات والأقسام).
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/lib/generated/prisma";

/* =========================================================================
   نسخ مُخزَّنة مؤقتاً لواجهة المتجر العامة — تُبطَل عبر
   revalidateTag("products" / "categories") في إجراءات لوحة التحكم.
   البحث النصي (q) يبقى بلا تخزين لأن مفاتيحه غير محدودة.
   ملاحظة: التخزين يمرّ عبر JSON فتصل التواريخ كنصوص — كروت المتجر
   لا تعرض تواريخ، لذا هذا آمن هنا.
   ========================================================================= */

/** أقسام المتجر — مُخزَّنة (تُعرض في شريط الأقسام: id + name فقط). */
export const getPublicCategories = unstable_cache(
  () => prisma.category.findMany({ orderBy: { name: "asc" } }),
  ["public-categories"],
  { tags: ["categories"], revalidate: 3600 },
);

/** أحدث المنتجات — مُخزَّنة. */
export const getLatestProductsCached = unstable_cache(
  (limit = 8) =>
    prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      include: { category: true },
    }),
  ["public-latest-products"],
  { tags: ["products"], revalidate: 3600 },
);

/** منتجات قسم محدّد — مُخزَّنة (الوسائط جزء من مفتاح الكاش تلقائياً). */
export const getProductsByCategoryCached = unstable_cache(
  (categoryId: number, limit?: number) =>
    prisma.product.findMany({
      where: { categoryId },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: { category: true },
    }),
  ["public-products-by-category"],
  { tags: ["products"], revalidate: 3600 },
);

/** جلب المنتجات مع إمكانية الفلترة بالقسم أو بالبحث النصي. */
export function getProducts(opts: { categoryId?: number; q?: string } = {}) {
  const where: Prisma.ProductWhereInput = {};
  if (opts.categoryId) where.categoryId = opts.categoryId;
  if (opts.q) where.name = { contains: opts.q };

  return prisma.product.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { category: true },
  });
}

