// تقديم ملفات الرفع (/uploads/...) من القرص وقت الطلب.
//
// السبب: في الإنتاج يفهرس خادم Next محتويات public مرة واحدة عند الإقلاع فقط،
// فأي ملف يُرفع بعد ذلك (صور الأعمال/الخدمات/المنتجات، الفيديوهات، ملفات التحميل)
// يرجع 404 حتى يُعاد تشغيل التطبيق. هذا الراوت يقرأ الملف من public/uploads
// مباشرة عند كل طلب، فتظهر الملفات فور رفعها.
// الملفات المفهرسة عند الإقلاع تُقدَّم من الطبقة الثابتة قبل الوصول هنا — لا تعارض.
import { createReadStream } from "fs";
import { stat } from "fs/promises";
import path from "path";
import { Readable } from "stream";
import { NextResponse } from "next/server";
import { IMAGE_EXT, VIDEO_EXT, DOC_EXT } from "@/lib/storage";

export const dynamic = "force-dynamic";

const UPLOAD_ROOT = path.join(process.cwd(), "public", "uploads");

const MIME: Record<string, string> = {
  // صور
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  avif: "image/avif",
  // فيديو
  mp4: "video/mp4",
  webm: "video/webm",
  mov: "video/quicktime",
  m4v: "video/x-m4v",
  ogg: "video/ogg",
  // مستندات
  pdf: "application/pdf",
  zip: "application/zip",
  rar: "application/vnd.rar",
  "7z": "application/x-7z-compressed",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ppt: "application/vnd.ms-powerpoint",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  txt: "text/plain",
  csv: "text/csv",
};

const ALLOWED_EXT = new Set<string>([...IMAGE_EXT, ...VIDEO_EXT, ...DOC_EXT]);

function notFound() {
  return new NextResponse(null, { status: 404 });
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path: segments } = await params;

  // حماية من اجتياز المسارات: نبني المسار ثم نتأكد أنه بقي داخل جذر الرفع.
  // (مقاطع params تصل مفكوكة الترميز من Next بالفعل — لا نفكّها مرة ثانية.)
  const root = path.resolve(UPLOAD_ROOT);
  const fullPath = path.resolve(root, segments.join("/"));
  if (!fullPath.startsWith(root + path.sep)) return notFound();

  // نفس قائمة الامتدادات المسموح رفعها — أي شيء آخر لا يُقدَّم.
  const ext = path.extname(fullPath).slice(1).toLowerCase();
  if (!ALLOWED_EXT.has(ext)) return notFound();

  let size: number;
  try {
    const info = await stat(fullPath);
    if (!info.isFile()) return notFound();
    size = info.size;
  } catch {
    return notFound();
  }

  // أسماء الملفات فريدة (طابع زمني + عشوائي) فلا تتغير محتوياتها — كاش طويل آمن.
  const baseHeaders: Record<string, string> = {
    "Content-Type": MIME[ext] ?? "application/octet-stream",
    "Accept-Ranges": "bytes",
    "Cache-Control": "public, max-age=31536000, immutable",
  };

  // دعم Range ضروري لتشغيل الفيديو (خاصة Safari/iOS يرفض التشغيل بدونه).
  const range = request.headers.get("range");
  if (range) {
    const match = /^bytes=(\d*)-(\d*)$/.exec(range.trim());
    const start = match?.[1] ? Number(match[1]) : 0;
    const end = match?.[2] ? Math.min(Number(match[2]), size - 1) : size - 1;
    if (!match || start > end || start >= size) {
      return new NextResponse(null, {
        status: 416,
        headers: { "Content-Range": `bytes */${size}` },
      });
    }
    return new NextResponse(
      Readable.toWeb(createReadStream(fullPath, { start, end })) as ReadableStream,
      {
        status: 206,
        headers: {
          ...baseHeaders,
          "Content-Range": `bytes ${start}-${end}/${size}`,
          "Content-Length": String(end - start + 1),
        },
      },
    );
  }

  return new NextResponse(
    Readable.toWeb(createReadStream(fullPath)) as ReadableStream,
    { headers: { ...baseHeaders, "Content-Length": String(size) } },
  );
}
