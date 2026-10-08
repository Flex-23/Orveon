"use client";

// مشغّل فيديو "غير قابل للتحميل" قدر الإمكان:
// - controlsList="nodownload" يخفي زر التحميل من قائمة المشغّل.
// - disablePictureInPicture يلغي صورة-داخل-صورة (منفذ تحميل غير مباشر).
// - onContextMenu يمنع "حفظ الفيديو باسم" من الزر الأيمن.
// ملاحظة: هذا يمنع التحميل العادي، لكنه لا يحمي 100% من مستخدم متمكّن
// (الرابط يبقى موجوداً في طلبات الشبكة) — للحماية الكاملة يلزم بثّ مُوقّع/مشفّر.
type ServiceVideoProps = {
  src: string;
  className?: string;
};

export function ServiceVideo({ src, className }: ServiceVideoProps) {
  return (
    <video
      controls
      controlsList="nodownload noremoteplayback"
      disablePictureInPicture
      preload="metadata"
      onContextMenu={(event) => event.preventDefault()}
      className={className}
      src={src}
    />
  );
}
