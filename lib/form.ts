// أدوات مشتركة لقراءة بيانات النماذج (FormData) وتحويل أخطاء zod —
// تُلغي التكرار في إجراءات الخادم (Server Actions).
import type { ZodError } from "zod";

/** يحوّل أخطاء zod إلى خريطة { اسم الحقل: الرسالة } (أوّل خطأ لكل حقل). */
export function fieldErrorsFromZod(error: ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "");
    if (key && !(key in out)) out[key] = issue.message;
  }
  return out;
}

/** يقرأ معرّفاً رقمياً صحيحاً من النموذج، أو null إن كان غير صالح. */
export function getId(formData: FormData, key: string): number | null {
  const n = Number(formData.get(key));
  return Number.isInteger(n) ? n : null;
}

/** يقرأ نصاً منظّفاً من الفراغات من النموذج. */
export function getTrimmed(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}
