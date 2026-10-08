"use server";

// إجراءات المصادقة (Server Actions): تسجيل / دخول / خروج.
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { createSession, destroySession } from "@/lib/auth/session";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { loginSchema, registerSchema } from "@/lib/validations/auth";
import { fieldErrorsFromZod } from "@/lib/form";
import { rateLimit, resetRateLimit } from "@/lib/rate-limit";

export type AuthState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

/** يقبل فقط مساراً داخلياً يبدأ بشرطة واحدة، وإلا فالرئيسية — منعاً لإعادة التوجيه المفتوح.
 * الشرطة العكسية مرفوضة أيضاً: المتصفحات تطبّع "/\evil.com" إلى "//evil.com" (رابط خارجي). */
function safeNext(value: FormDataEntryValue | null): string {
  const next = typeof value === "string" ? value : "";
  return next.startsWith("/") && !next.startsWith("//") && !next.includes("\\")
    ? next
    : "/";
}

/** عنوان IP للطالب (خلف بروكسي عكسي يصل عبر x-forwarded-for). */
async function clientIp(): Promise<string> {
  const h = await headers();
  return (
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    "unknown"
  );
}

// hash وهمي ثابت يُقارن به عند غياب الحساب — يوحّد زمن الرد فلا يكشف وجود الحسابات.
const DUMMY_HASH = "$2b$10$TX.Ptb.JyxJy6M5NNnN47eTr5PZFeze9GdJnaRTwqTC7iWLHzyYD2";

/** تسجيل زبون عادي جديد: الاسم + الرقم + المحافظة + كلمة مرور يختارها بنفسه. */
export async function registerAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    governorate: formData.get("governorate"),
    password: formData.get("password"),
    passwordConfirm: formData.get("passwordConfirm"),
  });

  if (!parsed.success) {
    return { fieldErrors: fieldErrorsFromZod(parsed.error) };
  }

  // حد أقصى للتسجيلات من نفس العنوان — يمنع إغراق القاعدة بحسابات وهمية.
  const ipLimit = rateLimit(`register:ip:${await clientIp()}`, 5, 60 * 60_000);
  if (!ipLimit.ok) {
    return {
      error: `محاولات تسجيل كثيرة. حاول مجدداً بعد ${Math.ceil(ipLimit.retryAfterSec / 60)} دقيقة.`,
    };
  }

  const { name, phone, governorate, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { phone } });
  if (existing) {
    return { fieldErrors: { phone: "هذا الرقم مسجّل مسبقاً" } };
  }

  // كلمة المرور تُخزَّن مجزّأة (bcrypt) فقط — بلا نسخة مشفَّرة قابلة للاسترجاع
  // (passwordEnc تلك مخصصة للحسابات التي يولّد المدير كلمتها؛ كلمة يختارها
  // الزبون بنفسه قد يعيد استخدامها بمواقع أخرى فلا يصح أن تكون قابلة للكشف).
  let user;
  try {
    user = await prisma.user.create({
      data: {
        name,
        phone,
        governorate,
        role: "member",
        passwordHash: await hashPassword(password),
      },
    });
  } catch (e) {
    // سباق تسجيلين متزامنين لنفس الرقم — قيد الفريدة في القاعدة هو الفيصل.
    if (e && typeof e === "object" && "code" in e && e.code === "P2002") {
      return { fieldErrors: { phone: "هذا الرقم مسجّل مسبقاً" } };
    }
    throw e;
  }

  await createSession({ userId: user.id, role: user.role, name: user.name });
  redirect("/");
}

/**
 * تسجيل الدخول بصفحة واحدة بمنطق مزدوج:
 * - حساب له كلمة مرور (مدير/أدمن/مشترك/زبون سجّل بنفسه): identifier = اسم المستخدم أو الرقم، secret = كلمة المرور.
 * - زبون قديم سجّل قبل اعتماد كلمات المرور (passwordHash فارغ): identifier = الرقم، secret = الاسم.
 */
export async function loginAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = loginSchema.safeParse({
    identifier: formData.get("identifier"),
    secret: formData.get("secret"),
  });

  if (!parsed.success) {
    return { fieldErrors: fieldErrorsFromZod(parsed.error) };
  }

  const { identifier, secret } = parsed.data;
  const next = safeNext(formData.get("next"));

  // حماية من التخمين بالقوة: حد لكل حساب مستهدف وحد أوسع لكل عنوان IP.
  const idKey = `login:id:${identifier}`;
  const idLimit = rateLimit(idKey, 5, 15 * 60_000);
  const ipLimit = rateLimit(`login:ip:${await clientIp()}`, 20, 15 * 60_000);
  if (!idLimit.ok || !ipLimit.ok) {
    const retry = Math.max(idLimit.retryAfterSec, ipLimit.retryAfterSec);
    return {
      error: `محاولات دخول كثيرة. حاول مجدداً بعد ${Math.ceil(retry / 60)} دقيقة.`,
    };
  }

  // المحاولة 1: حساب بكلمة مرور (مطابقة عبر اسم المستخدم loginCode أو الرقم)
  const passwordUser = await prisma.user.findFirst({
    where: {
      passwordHash: { not: null },
      OR: [{ loginCode: identifier }, { phone: identifier }],
    },
  });

  // تُنفَّذ المقارنة دائماً (بـ hash وهمي عند غياب الحساب) لتوحيد زمن الرد.
  const valid = await verifyPassword(
    secret,
    passwordUser?.passwordHash ?? DUMMY_HASH,
  );

  if (passwordUser?.passwordHash && valid) {
    if (passwordUser.isBanned) return { error: "تم حظر هذا الحساب." };
    resetRateLimit(idKey);
    await createSession({
      userId: passwordUser.id,
      role: passwordUser.role,
      name: passwordUser.name,
    });
    redirect(next);
  }

  // المحاولة 2: زبون قديم (سجّل قبل اعتماد كلمات المرور) — الرقم + الاسم
  const customer = await prisma.user.findFirst({
    where: { phone: identifier, name: secret, passwordHash: null },
  });

  if (customer) {
    if (customer.isBanned) return { error: "تم حظر هذا الحساب." };
    resetRateLimit(idKey);
    await createSession({
      userId: customer.id,
      role: customer.role,
      name: customer.name,
    });
    redirect(next);
  }

  return { error: "بيانات الدخول غير صحيحة. تحقّق من المدخلات وحاول مجدداً." };
}

/** تسجيل الخروج. */
export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/");
}
