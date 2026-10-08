// عميل Prisma بنمط Singleton لتجنّب إنشاء اتصالات متعددة أثناء التطوير (Hot Reload).
//
// مهم: نحمّل العميل المولَّد وقت التشغيل (createRequire) بدل import ثابت، حتى لا
// يضمّنه Turbopack داخل chunks الحزمة. التضمين كان يسبب مشكلتين:
// 1) تحذير "تتبّع المشروع كاملاً" أثناء البناء — index.js المولَّد يفتّش عن
//    schema.prisma بجولة على process.cwd().
// 2) فشل تحميل محرك libquery_engine-*.so.node على السيرفر — لأن __dirname داخل
//    الـ chunk لا يحتوي المحركات. الآن يعمل index.js الحقيقي من مجلده
//    lib/generated/prisma فيجد المحرك وschema.prisma مباشرة وبشكل مضمون.
import path from "node:path";
import { createRequire } from "node:module";
import type { PrismaClient } from "./generated/prisma";

const requireRuntime = createRequire(path.join(process.cwd(), "noop.js"));
const generatedClient = requireRuntime(
  path.join(process.cwd(), "lib", "generated", "prisma")
) as typeof import("./generated/prisma");

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new generatedClient.PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
