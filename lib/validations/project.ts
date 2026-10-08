// التحقق من بيانات نموذج «ابدأ مشروعك» (طلب مشروع).
import { z } from "zod";

/** خيارات المدة المتاحة — بدون أي ذكر للسعر. */
export const PROJECT_DURATIONS = [
  "أقل من شهر",
  "من شهر إلى 3 أشهر",
  "من 3 إلى 6 أشهر",
  "أكثر من 6 أشهر",
  "مرنة — حسب الاتفاق",
] as const;

export const projectRequestSchema = z.object({
  // بيانات أساسية تُملأ من تسجيل الزبون (قابلة للتعديل)
  name: z.string().trim().min(2, "الاسم مطلوب").max(150, "الاسم طويل جداً"),
  phone: z
    .string()
    .trim()
    .min(10, "رقم الهاتف غير صالح")
    .max(15, "رقم الهاتف غير صالح")
    .regex(/^[0-9+]+$/, "رقم الهاتف يجب أن يحتوي أرقاماً فقط"),
  governorate: z.string().trim().max(100).optional(),
  description: z
    .string()
    .trim()
    .min(10, "صف مشروعك بعشرة أحرف على الأقل")
    .max(3000, "الوصف طويل جداً"),
  duration: z.enum(PROJECT_DURATIONS, { message: "حدّد المدة المتوقعة للمشروع" }),
});

export type ProjectRequestInput = z.infer<typeof projectRequestSchema>;
