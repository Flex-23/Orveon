// استعلامات لوحة تحكم المتجر (إدارية).
import { prisma } from "@/lib/prisma";

// --- المنتجات والأقسام ---
export function getAllProducts(categoryId?: number) {
  return prisma.product.findMany({
    where: categoryId ? { categoryId } : undefined,
    orderBy: { createdAt: "desc" },
    include: { category: true },
  });
}

/** الأقسام مع عدد المنتجات في كل قسم (للشريط الجانبي وصفحة الإدارة). */
export function getCategoriesWithCounts() {
  return prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });
}

// --- الحجوزات ---
export function getAllReservations() {
  return prisma.reservation.findMany({
    orderBy: { createdAt: "desc" },
    include: { product: true, user: true },
  });
}

export function getReservationById(id: number) {
  return prisma.reservation.findUnique({
    where: { id },
    include: { product: true, user: true },
  });
}

// --- طلبات النسخ التجريبية ---
export function getAllTrialRequests() {
  return prisma.trialRequest.findMany({
    orderBy: { createdAt: "desc" },
    include: { work: true, user: true },
  });
}

export function getTrialRequestById(id: number) {
  return prisma.trialRequest.findUnique({
    where: { id },
    include: { work: true, user: true },
  });
}

// --- طلبات المشاريع (ابدأ مشروعك) ---
export function getAllProjectRequests() {
  return prisma.projectRequest.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: true },
  });
}

export function getProjectRequestById(id: number) {
  return prisma.projectRequest.findUnique({
    where: { id },
    include: { user: true },
  });
}

// --- الطلبات ---
export function getAllOrders() {
  return prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: true, items: true },
  });
}

export function getOrderByIdAdmin(id: number) {
  return prisma.order.findUnique({
    where: { id },
    include: { user: true, items: { include: { product: true } } },
  });
}
