// التحقق من بيانات نموذج طلب نسخة تجريبية لعمل.
import { z } from "zod";

export const trialRequestSchema = z.object({
  workId: z.coerce.number().int().positive(),
  // بيانات أساسية تُملأ من تسجيل الزبون (قابلة للتعديل)
  name: z.string().trim().min(2, "الاسم مطلوب").max(150, "الاسم طويل جداً"),
  phone: z
    .string()
    .trim()
    .min(10, "رقم الهاتف غير صالح")
    .max(15, "رقم الهاتف غير صالح")
    .regex(/^[0-9+]+$/, "رقم الهاتف يجب أن يحتوي أرقاماً فقط"),
  governorate: z.string().trim().max(100).optional(),
  details: z.string().trim().max(2000).optional(),
});

export type TrialRequestInput = z.infer<typeof trialRequestSchema>;
