// خريطة الموقع — الصفحات العامة + صفحات الخدمات من قاعدة البيانات.
import type { MetadataRoute } from "next";
import { getServiceCards } from "@/server/queries/content";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

// تُولَّد الخريطة عند الطلب على السيرفر (حيث القاعدة متاحة) بدل وقت البناء —
// getServiceCards مُخزَّنة (unstable_cache ساعة) فالكلفة شبه معدومة.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE_URL}/services`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/store`, changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE_URL}/about`, changeFrequency: "monthly", priority: 0.5 },
  ];

  // قد تُولَّد الخريطة أثناء البناء وقاعدة البيانات غير متاحة — نكتفي حينها بالصفحات الثابتة.
  let servicePages: MetadataRoute.Sitemap = [];
  try {
    const services = await getServiceCards();
    servicePages = services.map((s) => ({
      url: `${BASE_URL}/services/${s.id}`,
      changeFrequency: "weekly",
      priority: 0.7,
    }));
  } catch {
    servicePages = [];
  }

  return [...staticPages, ...servicePages];
}
