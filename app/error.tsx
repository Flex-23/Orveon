"use client"; // حدود الأخطاء يجب أن تكون مكوّنات عميل

import { useEffect } from "react";
import { NotFoundGlitch } from "@/components/error/not-found-glitch";

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    // سجّل الخطأ (يمكن لاحقاً ربطه بخدمة مراقبة)
    console.error(error);
  }, [error]);

  return (
    <NotFoundGlitch
      code="500"
      title="حدث خطأ غير متوقّع"
      description="واجهنا مشكلة أثناء تحميل هذا المحتوى. حاول مرّة أخرى أو عُد إلى الرئيسية."
      onRetry={() => unstable_retry()}
    />
  );
}
