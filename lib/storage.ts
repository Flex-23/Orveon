// طبقة تخزين الملفات — قابلة للتبديل لاحقاً بخدمة سحابية حقيقية.
// حالياً: تخزين محلي مؤقت داخل public/uploads.
import "server-only";
import { createWriteStream } from "fs";
import { mkdir } from "fs/promises";
import { Readable } from "stream";
import { pipeline } from "stream/promises";
import type { ReadableStream as NodeWebReadableStream } from "stream/web";
import path from "path";

const UPLOAD_ROOT = path.join(process.cwd(), "public", "uploads");

// جذر الملفات الخاصة (برامج المشتركين) — خارج public عمداً: لا يُقدَّم مباشرةً أبداً،
// بل عبر مسار API يتحقق من الجلسة والملكية (/api/member-programs/[id]).
const PRIVATE_ROOT = path.join(process.cwd(), "private-uploads");

// قوائم الامتدادات المسموح بها — تمنع رفع ملفات خطرة (svg/html/js) من نفس الأصل.
export const IMAGE_EXT = ["jpg", "jpeg", "png", "webp", "gif", "avif"] as const;
export const VIDEO_EXT = ["mp4", "webm", "mov", "m4v", "ogg"] as const;
export const DOC_EXT = [
  "pdf", "zip", "rar", "7z", "doc", "docx",
  "xls", "xlsx", "ppt", "pptx", "txt", "csv",
] as const;

const DEFAULT_MAX_BYTES = 100 * 1024 * 1024; // 100MB (يطابق حدّ Server Actions)

type SaveOptions = { allowedExt?: readonly string[]; maxBytes?: number };

/**
 * يحفظ ملفاً مرفوعاً ويعيد رابطه العام (/uploads/...).
 * يعيد null إذا لم يُرفع ملف، ويرمي خطأً إذا كان النوع/الحجم غير مسموح.
 * TODO: استبدل المحتوى بنداء خدمة سحابية (S3/Cloudinary) عند الإكمال — التوقيع يبقى ثابتاً.
 */
export async function saveUploadedFile(
  file: File | null,
  subdir = "misc",
  options: SaveOptions = {},
): Promise<string | null> {
  const filename = await persistFile(UPLOAD_ROOT, file, subdir, options);
  return filename ? `/uploads/${subdir}/${filename}` : null;
}

/**
 * يحفظ ملفاً خاصاً (لا يُقدَّم للعموم) ويعيد مساره النسبي داخل جذر الملفات الخاصة
 * (مثل "member-programs/xxx.rar") — يُخزَّن في قاعدة البيانات ويُقرأ عبر resolvePrivateFile.
 */
export async function savePrivateFile(
  file: File | null,
  subdir: string,
  options: SaveOptions = {},
): Promise<string | null> {
  const filename = await persistFile(PRIVATE_ROOT, file, subdir, options);
  return filename ? `${subdir}/${filename}` : null;
}

/**
 * يحوّل مساراً نسبياً مُخزَّناً إلى مسار مطلق داخل جذر الملفات الخاصة،
 * ويعيد null لأي مسار يحاول الخروج منه (حماية من اجتياز المسارات).
 */
export function resolvePrivateFile(relPath: string): string | null {
  const root = path.resolve(PRIVATE_ROOT);
  const full = path.resolve(root, relPath);
  return full.startsWith(root + path.sep) ? full : null;
}

/** التحقق من النوع/الحجم ثم البثّ إلى القرص. يعيد اسم الملف المُولَّد أو null إن لم يُرفع شيء. */
async function persistFile(
  root: string,
  file: File | null,
  subdir: string,
  options: SaveOptions,
): Promise<string | null> {
  if (!file || file.size === 0) return null;

  const { allowedExt = IMAGE_EXT, maxBytes = DEFAULT_MAX_BYTES } = options;

  if (file.size > maxBytes) {
    throw new Error("حجم الملف يتجاوز الحدّ المسموح.");
  }

  const ext = path
    .extname(file.name)
    .toLowerCase()
    .replace(/[^.a-z0-9]/g, "")
    .replace(/^\./, "");

  if (!ext || !allowedExt.includes(ext)) {
    throw new Error("نوع الملف غير مسموح.");
  }

  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const dir = path.join(root, subdir);
  await mkdir(dir, { recursive: true });

  // بثّ مباشر إلى القرص بدل تحميل الملف كاملاً في الذاكرة
  // (الفيديوهات قد تصل 100MB — التجميع في Buffer كان يستهلك RAM بلا داعٍ).
  await pipeline(
    Readable.fromWeb(file.stream() as NodeWebReadableStream<Uint8Array>),
    createWriteStream(path.join(dir, filename)),
  );

  return filename;
}
