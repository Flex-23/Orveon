// صفحة تشخيص مؤقتة — تعرض حالة الاتصال بقاعدة البيانات والخطأ الحقيقي كاملاً،
// لأن استضافة cPanel لا توفّر stderr.log وNext يخفي تفاصيل الأخطاء في الإنتاج.
// محمية بمفتاح سري في الرابط: /api/diag?key=...
// تُحذف (أو تُترك — لا تكشف شيئاً بدون المفتاح) بعد حل المشكلة.
import { readdirSync, statSync, existsSync } from "fs";
import path from "path";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const DIAG_KEY = "orv-diag-x9k27qw4m8t3";

/** يخفي كلمة السر من رابط قاعدة البيانات قبل عرضه. */
function maskDbUrl(raw: string | undefined): string {
  if (!raw) return "غير موجود ❌";
  try {
    const u = new URL(raw);
    return `${u.protocol}//${u.username}:***@${u.host}${u.pathname}`;
  } catch {
    return "موجود لكن صيغته غير صالحة ❌";
  }
}

/** يحوّل أي خطأ إلى تفاصيل قابلة للعرض. */
function errInfo(err: unknown) {
  const e = err as { name?: string; message?: string; code?: string; errorCode?: string };
  return {
    name: e?.name ?? "Error",
    code: e?.code ?? e?.errorCode ?? null,
    message: e?.message ?? String(err),
  };
}

export async function GET(request: Request) {
  const key = new URL(request.url).searchParams.get("key");
  if (key !== DIAG_KEY) return new NextResponse(null, { status: 404 });

  const report: Record<string, unknown> = {
    time: new Date().toISOString(),
    node: process.version,
    platform: `${process.platform} ${process.arch}`,
    cwd: process.cwd(),
    env: {
      NODE_ENV: process.env.NODE_ENV ?? "غير موجود ❌",
      DATABASE_URL: maskDbUrl(process.env.DATABASE_URL),
      AUTH_SECRET: process.env.AUTH_SECRET ? "موجود ✅" : "غير موجود ❌",
    },
  };

  // محتويات مجلد عميل Prisma — يكشف أي تعديل يدوي (ملفات ناقصة/مضافة/بتواريخ مختلفة).
  const prismaDir = path.join(process.cwd(), "lib", "generated", "prisma");
  if (existsSync(prismaDir)) {
    report.prismaDirFiles = readdirSync(prismaDir).map((f) => {
      const s = statSync(path.join(prismaDir, f));
      return `${f} — ${(s.size / 1024 / 1024).toFixed(1)}MB — عُدّل ${s.mtime.toISOString()}`;
    });
  } else {
    report.prismaDirFiles = "المجلد lib/generated/prisma غير موجود ❌";
  }

  // استيراد ديناميكي داخل try حتى نلتقط حتى فشل تحميل عميل Prisma نفسه (وليس فقط فشل الاتصال).
  try {
    const { prisma } = await import("@/lib/prisma");
    report.prismaLoad = "تحميل العميل نجح ✅";
    try {
      await prisma.$queryRaw`SELECT 1`;
      report.dbConnection = "الاتصال بالقاعدة نجح ✅";
      try {
        const works = await prisma.work.count();
        const services = await prisma.service.count();
        report.dbQueries = `الاستعلامات تعمل ✅ (الأعمال: ${works}، الخدمات: ${services})`;
      } catch (err) {
        report.dbQueries = { failed: "استعلام الجداول فشل ❌", ...errInfo(err) };
      }
    } catch (err) {
      report.dbConnection = { failed: "الاتصال بالقاعدة فشل ❌", ...errInfo(err) };
    }
  } catch (err) {
    report.prismaLoad = { failed: "تحميل عميل Prisma نفسه فشل ❌", ...errInfo(err) };
  }

  return NextResponse.json(report, {
    headers: { "Cache-Control": "no-store" },
  });
}
