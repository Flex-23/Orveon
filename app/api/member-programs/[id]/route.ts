// تنزيل ملف برنامج مشترك — محمي: المالك نفسه، أو المدير/أدمن بصلاحية إدارة المشتركين.
// الملفات مخزّنة خارج public (private-uploads) فلا تُقدَّم إلا عبر هذا المسار.
import { createReadStream } from "fs";
import { stat } from "fs/promises";
import path from "path";
import { Readable } from "stream";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { hasPermission } from "@/lib/auth/permissions";
import { resolvePrivateFile } from "@/lib/storage";

const MIME: Record<string, string> = {
  zip: "application/zip",
  rar: "application/vnd.rar",
  "7z": "application/x-7z-compressed",
  pdf: "application/pdf",
  txt: "text/plain",
  csv: "text/csv",
};

/** 404 موحّد — لا نكشف لغير المخوّل هل الملف موجود أصلاً. */
function notFoundResponse() {
  return new NextResponse(null, { status: 404 });
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) {
    // زائر غير مسجّل ضغط رابطاً منسوخاً — نوجّهه للدخول ثم صفحة حسابه.
    return NextResponse.redirect(new URL("/login?next=/profile", request.url));
  }

  const { id } = await params;
  const programId = Number(id);
  if (!Number.isInteger(programId)) return notFoundResponse();

  const program = await prisma.memberProgram.findUnique({
    where: { id: programId },
  });
  if (!program) return notFoundResponse();

  // المالك فقط — أو طاقم الإدارة المخوّل بإدارة المشتركين (نفس حارس الرفع).
  const allowed =
    program.userId === user.id || hasPermission(user, "canManageMembers");
  if (!allowed) return notFoundResponse();

  const fullPath = resolvePrivateFile(program.fileUrl);
  if (!fullPath) return notFoundResponse();

  let size: number;
  try {
    size = (await stat(fullPath)).size;
  } catch {
    return notFoundResponse();
  }

  const ext = path.extname(fullPath).slice(1).toLowerCase();
  // اسم تنزيل مقروء من عنوان الملف (بترميز UTF-8 للعربية) مع بديل ASCII.
  const asciiName = `program-${program.id}.${ext}`;
  const utf8Name = encodeURIComponent(`${program.title}.${ext}`);

  return new NextResponse(
    Readable.toWeb(createReadStream(fullPath)) as ReadableStream,
    {
      headers: {
        "Content-Type": MIME[ext] ?? "application/octet-stream",
        "Content-Length": String(size),
        "Content-Disposition": `attachment; filename="${asciiName}"; filename*=UTF-8''${utf8Name}`,
        "Cache-Control": "private, no-store",
      },
    },
  );
}
