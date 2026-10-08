// توقيع/التحقق من رموز الجلسة (JWT) باستخدام jose — متوافق مع Edge/Middleware.
import { SignJWT, jwtVerify } from "jose";

export type SessionPayload = {
  userId: number;
  role: "visitor" | "member" | "admin" | "manager";
  name: string;
};

const SESSION_DURATION = "7d";

function getSecretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET غير مُعرّف في متغيرات البيئة (.env)");
  }
  // سر ضعيف = إمكانية تزوير جلسة أدمن/مدير. نرفض الإقلاع في الإنتاج بسر قصير
  // أو بقيمة التطوير الافتراضية. ولّد سراً قوياً: openssl rand -base64 48
  if (
    process.env.NODE_ENV === "production" &&
    (secret.length < 32 || secret.startsWith("dev-secret"))
  ) {
    throw new Error(
      "AUTH_SECRET ضعيف — استخدم قيمة عشوائية بطول 32 حرفاً على الأقل في الإنتاج.",
    );
  }
  return new TextEncoder().encode(secret);
}

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(SESSION_DURATION)
    .sign(getSecretKey());
}

export async function verifySession(
  token: string | undefined,
): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return {
      userId: payload.userId as number,
      role: payload.role as SessionPayload["role"],
      name: payload.name as string,
    };
  } catch {
    return null;
  }
}
