// حماية المسارات على مستوى الـ Edge قبل الوصول للصفحة (Next.js 16: proxy بدل middleware).
// ملاحظة: التحقق النهائي (الحظر/الصلاحيات الدقيقة) يتم أيضاً داخل الصفحات على الخادم.
import { NextResponse, type NextRequest } from "next/server";
import { verifySession } from "@/lib/auth/jwt";
import { SESSION_COOKIE } from "@/lib/auth/constants";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = await verifySession(token);

  // مسارات تتطلب تسجيل الدخول
  if (!session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // لوحة التحكم: للأدمن والمدير فقط
  if (pathname.startsWith("/dashboard")) {
    if (session.role !== "admin" && session.role !== "manager") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/profile/:path*", "/dashboard/:path*"],
};
