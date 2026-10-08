// التحقق من بيانات الدفع/التوصيل.
import { z } from "zod";

export const checkoutSchema = z
  .object({
    paymentMethod: z.enum(["online", "cash_on_delivery"]),
    deliveryName: z.string().trim().optional(),
    deliveryPhone: z.string().trim().optional(),
    governorate: z.string().trim().optional(),
    address: z.string().trim().optional(),
    nearestLandmark: z.string().trim().optional(),
  })
  .superRefine((data, ctx) => {
    // عند التوصيل، الحقول إلزامية
    if (data.paymentMethod === "cash_on_delivery") {
      const required: [keyof typeof data, string][] = [
        ["deliveryName", "الاسم مطلوب"],
        ["deliveryPhone", "رقم الهاتف مطلوب"],
        ["governorate", "المحافظة مطلوبة"],
        ["address", "العنوان مطلوب"],
        ["nearestLandmark", "أقرب نقطة دالة مطلوبة"],
      ];
      for (const [field, message] of required) {
        if (!data[field] || String(data[field]).length < 2) {
          ctx.addIssue({ code: "custom", path: [field], message });
        }
      }
    }
  });

export type CheckoutInput = z.infer<typeof checkoutSchema>;
