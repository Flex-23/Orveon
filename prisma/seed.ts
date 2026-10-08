// ============================================================
// Orveon — بيانات تجريبية (Seed) — اختيارية للاختبار
// التشغيل: npm run db:seed  (يتطلب قاعدة بيانات جاهزة ومتصلة)
// ============================================================
import bcrypt from "bcryptjs";
import { PrismaClient } from "../lib/generated/prisma";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 بدء إدخال البيانات التجريبية...");

  // --- مدير افتراضي (Manager) ---
  // رقم الدخول: 07700000000 | كلمة المرور: Admin@123 (غيّرها بعد أول دخول)
  const passwordHash = await bcrypt.hash("Admin@123", 10);
  const manager = await prisma.user.upsert({
    where: { phone: "07700000000" },
    update: {},
    create: {
      name: "مدير أورفيون",
      phone: "07700000000",
      governorate: "بغداد",
      passwordHash,
      role: "manager",
      permissions: {
        create: {
          canAccessDashboard: true,
          canManageProducts: true,
          canManageOrders: true,
          canManageReservations: true,
          canManageMembers: true,
          canManageServices: true,
          canManageContent: true,
        },
      },
    },
  });
  console.log(`✓ المدير: ${manager.phone} (كلمة المرور: Admin@123)`);

  // --- الأقسام ---
  const catNames = ["برمجيات", "تطبيقات جوال", "تصاميم"];
  const categories = [];
  for (const name of catNames) {
    const c = await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    categories.push(c);
  }
  console.log(`✓ الأقسام: ${categories.length}`);

  // --- منتجات ---
  await prisma.product.createMany({
    data: [
      { name: "نظام نقاط بيع POS", categoryId: categories[0].id, quantity: 10, price: 250.0, status: "available" },
      { name: "تطبيق متجر إلكتروني", categoryId: categories[1].id, quantity: 0, price: 500.0, status: "out_of_stock" },
      { name: "هوية بصرية كاملة", categoryId: categories[2].id, quantity: 5, price: 150.0, status: "coming_soon" },
    ],
  });
  console.log("✓ المنتجات: 3");

  // --- أعمال (محتوى الصفحة الرئيسية) ---
  await prisma.work.createMany({
    data: [
      { title: "مشروع منصة تعليمية", description: "منصة متكاملة لإدارة الدورات." },
      { title: "تطبيق توصيل", description: "تطبيق طلبات وتوصيل سريع." },
    ],
  });
  console.log("✓ الأعمال: 2");

  // --- خدمة مع صور وفيديوهات ---
  await prisma.service.create({
    data: {
      title: "تطوير المتاجر الإلكترونية",
      description: "نبني لك متجراً إلكترونياً احترافياً متكاملاً.",
      images: { create: [{ imageUrl: "/uploads/sample-1.jpg" }] },
      videos: { create: [{ title: "مقدمة", videoUrl: "/uploads/sample-intro.mp4" }] },
    },
  });
  console.log("✓ الخدمات: 1");

  console.log("✅ اكتمل إدخال البيانات التجريبية.");
}

main()
  .catch((e) => {
    console.error("❌ خطأ أثناء الإدخال:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
