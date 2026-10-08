// طبقة إرسال واتساب — حالياً تعتمد على فتح تطبيق واتساب على الجهاز مع نص جاهز.
// لاحقاً يمكن استبدالها بـ Cloud API / Twilio دون تغيير المستدعين.

// رمز الدولة الافتراضي (العراق). يمكن تجاوزه عبر متغيّر البيئة.
const DEFAULT_COUNTRY_CODE = process.env.WHATSAPP_COUNTRY_CODE || "964";

// عنوان الموقع — يُستخدم لبناء رابط الدخول داخل رسالة الترحيب.
// الافتراضي هو رابط المنصة المنشورة (وليس localhost) حتى لا تصل روابط محلية
// للمشتركين/الأدمن إذا غاب NEXT_PUBLIC_APP_URL وقت البناء.
const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || "https://orvion-iq.com").replace(/\/+$/, "");

/** رابط يفتح صفحة تسجيل الدخول ثم يوجّه المشترك مباشرةً إلى صفحة حسابه. */
export function buildProfileLoginLink(): string {
  return `${APP_URL}/login?next=${encodeURIComponent("/profile")}`;
}

/**
 * يحوّل الرقم إلى صيغة دولية كاملة يفهمها واتساب (أرقام فقط، مع رمز الدولة).
 * هذا هو سبب «فتح التطبيق دون فتح المحادثة»: الرقم المحلي مثل 0770... غير صالح
 * لرابط wa.me — يجب أن يكون 964770... بلا صفر بادئ.
 */
export function normalizePhone(
  phone: string,
  countryCode: string = DEFAULT_COUNTRY_CODE,
): string {
  let num = phone.replace(/\D/g, "");
  if (!num) return num;

  if (num.startsWith("00")) {
    // صيغة دولية بصفرين بادئين: 00964... → 964...
    num = num.slice(2);
  } else if (num.startsWith("0")) {
    // رقم محلي بصفر بادئ: 0770... → 964770...
    num = countryCode + num.slice(1);
  } else if (!num.startsWith(countryCode)) {
    // رقم محلي بلا صفر ولا رمز دولة: 770... → 964770...
    num = countryCode + num;
  }
  return num;
}

/**
 * يبني رابط واتساب يفتح المحادثة مع الرقم المطلوب ورسالة جاهزة.
 * استخدمه في الواجهة عبر <a href={buildWhatsAppLink(...)} target="_blank">.
 */
export function buildWhatsAppLink(phone: string, message: string): string {
  const num = normalizePhone(phone);
  return `https://wa.me/${num}?text=${encodeURIComponent(message)}`;
}

/** نص ترحيبي جاهز لبيانات دخول المشترك المُضاف من الشركة. */
export function buildWelcomeMessage(params: {
  name: string;
  username: string;
  password: string;
  serviceName?: string;
}): string {
  const { name, username, password, serviceName } = params;
  return [
    `مرحباً ${name} 👋`,
    "تم إنشاء حسابك في منصة أورفيون.",
    serviceName ? `الخدمة: ${serviceName}` : null,
    "",
    "بيانات الدخول الخاصة بك:",
    `• اسم المستخدم: ${username}`,
    `• كلمة المرور: ${password}`,
    "",
    "سجّل دخولك من الرابط التالي وستصل مباشرةً إلى صفحة حسابك:",
    buildProfileLoginLink(),
  ]
    .filter((line) => line !== null)
    .join("\n");
}

/** نص ترحيبي جاهز لبيانات دخول الأدمن المُضاف من المدير (يدخل برقم هاتفه + كلمة المرور).
 * كلمة المرور تُحفَظ مشفَّرة ولا يمكن استرجاعها لاحقاً — عند إعادة الإرسال (بلا password)
 * تُذكر إشارة إليها بدلاً من نصّها، ويمكن للمدير تعيين كلمة جديدة من صفحة التعديل. */
export function buildAdminWelcomeMessage(params: {
  name: string;
  phone: string;
  password?: string;
}): string {
  const { name, phone, password } = params;
  return [
    `مرحباً ${name} 👋`,
    "تم إنشاء حسابك الإداري في منصة أورفيون.",
    "",
    "بيانات الدخول الخاصة بك:",
    `• رقم الدخول: ${phone}`,
    `• كلمة المرور: ${password ?? "التي زوّدتك بها الإدارة (إن نسيتها تواصل مع المدير لتعيين كلمة جديدة)"}`,
    "",
    "سجّل دخولك من الرابط التالي وستصل مباشرةً إلى صفحة حسابك:",
    buildProfileLoginLink(),
  ].join("\n");
}
