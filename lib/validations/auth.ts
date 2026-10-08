// مخططات التحقق من المدخلات (zod) لنماذج المصادقة.
import { z } from "zod";

// قائمة المحافظات العراقية (للاختيار في التسجيل)
export const GOVERNORATES = [
  "بغداد",
  "البصرة",
  "نينوى",
  "أربيل",
  "النجف",
  "كربلاء",
  "كركوك",
  "الأنبار",
  "ذي قار",
  "بابل",
  "ديالى",
  "صلاح الدين",
  "واسط",
  "ميسان",
  "القادسية",
  "المثنى",
  "دهوك",
  "السليمانية",
] as const;

const phoneSchema = z
  .string()
  .trim()
  .min(10, "رقم الهاتف غير صالح")
  .max(15, "رقم الهاتف غير صالح")
  .regex(/^[0-9+]+$/, "رقم الهاتف يجب أن يحتوي أرقاماً فقط");

// تُشذَّب كلمة المرور من الطرفين لأن loginSchema يشذّب secret أيضاً —
// بدون ذلك، مسافة زائدة عند التسجيل تمنع الدخول للأبد.
const passwordSchema = z
  .string()
  .trim()
  .min(8, "كلمة المرور قصيرة (8 أحرف على الأقل)")
  .max(100, "كلمة المرور طويلة جداً");

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, "الاسم قصير جداً").max(150, "الاسم طويل جداً"),
    phone: phoneSchema,
    governorate: z.string().trim().min(2, "اختر المحافظة"),
    password: passwordSchema,
    passwordConfirm: z.string().trim(),
  })
  .refine((d) => d.password === d.passwordConfirm, {
    message: "كلمتا المرور غير متطابقتين",
    path: ["passwordConfirm"],
  });

export const loginSchema = z.object({
  identifier: z.string().trim().min(2, "أدخل الاسم أو اسم المستخدم"),
  secret: z.string().trim().min(2, "أدخل الرقم أو كلمة المرور"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
