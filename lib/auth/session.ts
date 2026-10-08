// إدارة جلسة المستخدم عبر كوكي HTTP-only (للاستخدام في الخادم فقط).
import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { signSession, verifySession, type SessionPayload } from "./jwt";
import { SESSION_COOKIE, SESSION_MAX_AGE as MAX_AGE } from "./constants";

export { SESSION_COOKIE };

/** إنشاء جلسة وكتابة الكوكي. */
export async function createSession(payload: SessionPayload): Promise<void> {
  const token = await signSession(payload);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

/** قراءة الجلسة (payload فقط) من الكوكي.
 * مغلّفة بـ cache() لإزالة تكرار التحقق من JWT ضمن الطلب الواحد. */
export const getSession = cache(async (): Promise<SessionPayload | null> => {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  return verifySession(token);
});

/** جلب المستخدم الكامل من قاعدة البيانات مع صلاحياته. يعيد null إن لم يوجد أو كان محظوراً.
 * مغلّفة بـ cache(): تُستدعى من الناف بار والصفحة واللَي آوت في نفس الطلب،
 * فتُنفَّذ مرة واحدة فقط بدل استعلام قاعدة بيانات لكل استدعاء. */
export const getCurrentUser = cache(async () => {
  const session = await getSession();
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { permissions: true },
  });

  if (!user || user.isBanned) return null;
  return user;
});

/** حذف الجلسة (تسجيل الخروج). */
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
