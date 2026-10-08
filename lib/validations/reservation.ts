// التحقق من بيانات نموذج حجز منتج.
import { z } from "zod";

export const reservationSchema = z.object({
  productId: z.coerce.number().int().positive(),
  // بيانات أساسية تُملأ من تسجيل الزبون (قابلة للتعديل)
  name: z.string().trim().min(2, "الاسم مطلوب").max(150, "الاسم طويل جداً"),
  phone: z
    .string()
    .trim()
    .min(10, "رقم الهاتف غير صالح")
    .max(15, "رقم الهاتف غير صالح")
    .regex(/^[0-9+]+$/, "رقم الهاتف يجب أن يحتوي أرقاماً فقط"),
  governorate: z.string().trim().max(100).optional(),
  // بيانات يُدخلها الزبون
  nearestLandmark: z.string().trim().max(255).optional(),
  quantity: z.coerce.number().int().min(1, "الكمية يجب أن تكون 1 على الأقل").max(9999),
  note: z.string().trim().max(2000).optional(),
});

export type ReservationInput = z.infer<typeof reservationSchema>;
