// استعلامات محتوى الصفحة الرئيسية (أعمال + خدمات).
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

export function getWorks() {
  return prisma.work.findMany({ orderBy: { createdAt: "desc" } });
}

export function getWorkById(id: number) {
  return prisma.work.findUnique({ where: { id } });
}

export function getServices() {
  return prisma.service.findMany({
    orderBy: { createdAt: "desc" },
    include: { images: true, videos: true },
  });
}

export function getServiceById(id: number) {
  return prisma.service.findUnique({
    where: { id },
    include: { images: true, videos: true },
  });
}

/* =========================================================================
   نسخ عامة مُخزَّنة مؤقتاً (unstable_cache) للصفحات العامة — تُبطَل عبر
   revalidateTag("works" / "services") في إجراءات لوحة التحكم.
   ملاحظة مهمة: التخزين يمرّ عبر JSON، لذا تُنتقى حقول نصية/رقمية فقط
   (بلا Date/Decimal) حتى لا تتغيّر الأنواع عند القراءة من الكاش.
   ========================================================================= */

/** حقول العمل التي تحتاجها كروت "أعمالنا" فقط. */
export type WorkForCard = {
  id: number;
  title: string;
  description: string | null;
  imageUrl: string | null;
};

/** أعمال الصفحة الرئيسية — مُخزَّنة، بالحقول المعروضة فقط. */
export const getPublicWorks = unstable_cache(
  (): Promise<WorkForCard[]> =>
    prisma.work.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true, description: true, imageUrl: true },
    }),
  ["public-works"],
  { tags: ["works"], revalidate: 3600 },
);

/** خدمات بشكل الكارد فقط (بلا فيديوهات وروابط تحميل — لا تُسرَّب للـ HTML العام). */
export const getServiceCards = unstable_cache(
  () =>
    prisma.service.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        description: true,
        images: { select: { imageUrl: true }, orderBy: { id: "asc" }, take: 1 },
      },
    }),
  ["public-service-cards"],
  { tags: ["services"], revalidate: 3600 },
);

/** تفاصيل خدمة لصفحتها العامة — مُخزَّنة، بالحقول المعروضة فقط. */
export const getPublicServiceById = unstable_cache(
  (id: number) =>
    prisma.service.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        downloadFileUrl: true,
        images: { select: { imageUrl: true }, orderBy: { id: "asc" } },
        videos: {
          select: { id: true, videoUrl: true, title: true },
          orderBy: { id: "asc" },
        },
      },
    }),
  ["public-service-by-id"],
  { tags: ["services"], revalidate: 3600 },
);
