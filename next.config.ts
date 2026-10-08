import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ينتج .next/standalone مع node_modules مصغّر جاهز للسيرفر — راجع DEPLOY.md
  // وسكربت scripts/package-deploy.mjs. يلغي الحاجة لـ Run NPM Install على cPanel.
  output: "standalone",
  // إبقاء Prisma خارج حزمة الـ bundle على الخادم (يحل تحذير التتبّع ويضمن عمله).
  serverExternalPackages: ["@prisma/client", "prisma"],
  // عميل Prisma المولَّد في lib/generated يجرّ تتبّع كامل المشروع إلى مخرجات
  // النشر (بما فيها مجلد الرفع الضخم) — نستثني ما لا يخص الكود.
  outputFileTracingExcludes: {
    "*": [
      "./public/uploads/**",
      // مخرجات تغليف النشر — بدون هذا الاستثناء يسحبها التتبّع داخل الحزمة الجديدة (حزمة داخل حزمة).
      "./deploy-package/**",
      "./scripts/.sharp-linux/**",
      "./orveon-deploy.zip",
    ],
  },
  // تعطيل محسّن الصور (sharp) نهائياً: على استضافة cPanel المشتركة عدة عمليات
  // تحسين متزامنة تتجاوز حد موارد الحساب فتُقتل عملية Node ويرجع السيرفر 502
  // لكل الطلبات المتزامنة (صور مكسورة عشوائياً + انقطاعات). الصور تُقدَّم كما
  // رُفعت — وهي صغيرة أصلاً — والكلفة أقل بكثير من انهيار التطبيق.
  images: {
    unoptimized: true,
  },
  // رفع حدّ حجم بيانات Server Actions للسماح برفع الصور والفيديوهات والملفات.
  experimental: {
    serverActions: {
      bodySizeLimit: "100mb",
    },
    // مهم: عند وجود proxy.ts يخزّن Next نسخة من جسم الطلب بحدّ افتراضي 10MB فقط،
    // فيُقتطع رفع الملفات الكبيرة ويظهر خطأ "Unexpected end of form".
    // نرفع الحدّ ليطابق حدّ Server Actions.
    proxyClientMaxBodySize: "100mb",
  },
  // ترويسات أمان أساسية على كل المسارات.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // يمنع المتصفح من تخمين نوع الملف (مهم لمجلد الرفع /uploads).
          { key: "X-Content-Type-Options", value: "nosniff" },
          // يفرض HTTPS بعد أول زيارة (تتجاهله المتصفحات على http المحلي).
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains",
          },
          // حماية من التضمين في إطارات خارجية (clickjacking).
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
