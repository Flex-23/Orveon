import { NotFoundGlitch } from "@/components/error/not-found-glitch";

// تظهر لأي رابط غير مطابق أو عند استدعاء notFound() داخل أي مقطع.
export default function NotFound() {
  return <NotFoundGlitch code="404" />;
}
