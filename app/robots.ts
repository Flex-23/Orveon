// ملف robots.txt — يسمح بفهرسة الصفحات العامة ويمنع الصفحات الخاصة/الإدارية.
import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/dashboard/",
        "/profile",
        "/cart",
        "/checkout",
        "/orders/",
        "/login",
        "/register",
      ],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
