"use client"; // حدود الأخطاء يجب أن تكون مكوّنات عميل

// يُستبدَل به التخطيط الجذري عند حدوث خطأ داخله، لذا يجب أن يضمّ <html> و<body>
// وأنماطه الخاصة (يفقد Navbar/Footer/الثيم لأنه يحلّ محلّ التخطيط).
import "./globals.css";
import { NotFoundGlitch } from "@/components/error/not-found-glitch";

export default function GlobalError({
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className="min-h-screen antialiased">
        <NotFoundGlitch
          className="min-h-screen"
          code="500"
          title="حدث خطأ في الموقع"
          description="واجهنا مشكلة غير متوقّعة. حاول مرّة أخرى أو عُد إلى الرئيسية."
          onRetry={() => unstable_retry()}
        />
      </body>
    </html>
  );
}
