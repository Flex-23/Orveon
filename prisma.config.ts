// إعدادات Prisma CLI — تحل محل `package.json#prisma` المهجورة (تُحذف في Prisma 7).
import { defineConfig } from "prisma/config";

// مع وجود هذا الملف يتوقف Prisma عن تحميل .env تلقائياً — نحمّله بأنفسنا.
// على السيرفر (cPanel) المتغيرات تأتي من لوحة الاستضافة فلا نحتاج الملف،
// لذا نتجاهل غيابه أو قِدم نسخة Node (loadEnvFile متوفرة من 20.12+).
try {
  process.loadEnvFile();
} catch {
  // لا يوجد .env أو Node قديمة — المتغيرات تأتي من البيئة مباشرة.
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
});
