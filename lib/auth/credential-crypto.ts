// تشفير/فك تشفير بيانات اعتماد قابلة للاسترجاع (AES-256-GCM) — للخادم فقط.
// الغرض: حفظ نسخة من كلمة مرور الأدمن يمكن للمدير عرضها وإرسالها عبر واتساب،
// مع بقائها مشفَّرة في القاعدة: تسريب القاعدة وحدها لا يكشفها لأن المفتاح خارجها.
// التحقق من الدخول يبقى عبر bcrypt (passwordHash) حصراً — هذه النسخة للعرض الإداري فقط.
import "server-only";
import { createCipheriv, createDecipheriv, hkdfSync, randomBytes } from "node:crypto";

const VERSION = "v1";

function getKey(): Buffer {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET غير مُعرّف في متغيرات البيئة (.env)");
  }
  // مفتاح مستقل عن توقيع الجلسات عبر HKDF بسياق مخصّص.
  // ملاحظة: تغيير AUTH_SECRET يجعل النسخ المخزَّنة غير قابلة للفك (تُعرض كغير متوفرة).
  return Buffer.from(hkdfSync("sha256", secret, "orveon-credential", VERSION, 32));
}

/** يشفّر نصاً ويعيد سلسلة ذاتية الوصف: v1:iv:tag:ciphertext (كلها base64). */
export function encryptCredential(plain: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  return [
    VERSION,
    iv.toString("base64"),
    cipher.getAuthTag().toString("base64"),
    ciphertext.toString("base64"),
  ].join(":");
}

/**
 * يفك تشفير قيمة مخزَّنة. يعيد null بدل رمي خطأ لأي قيمة غائبة/تالفة/مُعدَّلة
 * أو مشفَّرة بسرٍّ قديم — الواجهة تتعامل مع الغياب بعرض «غير متوفرة».
 */
export function decryptCredential(stored: string | null | undefined): string | null {
  if (!stored) return null;
  try {
    const [version, ivB64, tagB64, ctB64] = stored.split(":");
    if (version !== VERSION || !ivB64 || !tagB64 || !ctB64) return null;
    const decipher = createDecipheriv("aes-256-gcm", getKey(), Buffer.from(ivB64, "base64"));
    decipher.setAuthTag(Buffer.from(tagB64, "base64"));
    return Buffer.concat([
      decipher.update(Buffer.from(ctB64, "base64")),
      decipher.final(),
    ]).toString("utf8");
  } catch {
    return null;
  }
}
