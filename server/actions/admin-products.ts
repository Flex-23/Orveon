"use server";

// إجراءات إدارة المنتجات والأقسام (لوحة المتجر).
import { revalidatePath, revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/guards";
import { saveUploadedFile, IMAGE_EXT } from "@/lib/storage";
import { getId } from "@/lib/form";
import type { ProductStatus } from "@/lib/generated/prisma";

// إبطال كاش استعلامات المتجر العامة المُخزَّنة (unstable_cache) في server/queries/products.ts.
// المنتجات المُخزَّنة تتضمن بيانات قسمها، لذا تعديل الأقسام يُبطل الاثنين معاً.
function revalidateStoreCache() {
  revalidateTag("products", "max");
  revalidateTag("categories", "max");
}

export type AdminActionState = {
  error?: string;
  success?: string;
  fieldErrors?: Record<string, string>;
  // القيم المُدخَلة تُعاد عند الخطأ لإبقاء الحقول معبّأة (لا يُفرّغ النموذج).
  values?: Record<string, string>;
};

const VALID_STATUS: ProductStatus[] = ["available", "out_of_stock", "coming_soon"];

export async function createCategoryAction(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requirePermission("canManageProducts");

  const name = String(formData.get("name") ?? "").trim();
  if (name.length < 2) {
    return { fieldErrors: { name: "اسم القسم قصير جداً" }, values: { name } };
  }

  const existing = await prisma.category.findUnique({ where: { name } });
  if (existing) return { fieldErrors: { name: "هذا القسم موجود مسبقاً" }, values: { name } };

  await prisma.category.create({ data: { name } });
  revalidatePath("/dashboard/store/categories");
  revalidatePath("/dashboard/store/products");
  revalidateStoreCache();
  revalidatePath("/store");
  return { success: `تم إضافة القسم «${name}».` };
}

export async function createProductAction(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requirePermission("canManageProducts");

  const name = String(formData.get("name") ?? "").trim();
  const quantity = Number(formData.get("quantity"));
  const price = Number(formData.get("price"));
  const statusRaw = String(formData.get("status") ?? "available") as ProductStatus;
  const categoryRaw = formData.get("categoryId");
  const image = formData.get("image") as File | null;
  const values = {
    name,
    quantity: String(formData.get("quantity") ?? ""),
    price: String(formData.get("price") ?? ""),
    status: statusRaw,
    categoryId: categoryRaw ? String(categoryRaw) : "",
  };

  const fieldErrors: Record<string, string> = {};
  if (name.length < 2) fieldErrors.name = "اسم المادة مطلوب";
  if (!Number.isFinite(quantity) || quantity < 0) fieldErrors.quantity = "كمية غير صالحة";
  if (!Number.isFinite(price) || price <= 0) fieldErrors.price = "سعر غير صالح";
  if (!VALID_STATUS.includes(statusRaw)) fieldErrors.status = "حالة غير صالحة";
  if (Object.keys(fieldErrors).length) return { fieldErrors, values };

  const categoryId =
    categoryRaw && String(categoryRaw) !== "" ? Number(categoryRaw) : null;

  let imageUrl: string | null = null;
  try {
    imageUrl = await saveUploadedFile(image, "products", { allowedExt: IMAGE_EXT });
  } catch {
    return { error: "تعذّر رفع الصورة. حاول مجدداً.", values };
  }

  await prisma.product.create({
    data: { name, quantity, price, status: statusRaw, categoryId, imageUrl },
  });

  revalidatePath("/dashboard/store/products");
  revalidateStoreCache();
  revalidatePath("/store");
  return { success: `تم إضافة المادة «${name}».` };
}

export async function updateProductAction(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requirePermission("canManageProducts");

  const id = getId(formData, "productId");
  if (id === null) return { error: "معرّف المنتج غير صالح." };

  const name = String(formData.get("name") ?? "").trim();
  const quantity = Number(formData.get("quantity"));
  const price = Number(formData.get("price"));
  const statusRaw = String(formData.get("status") ?? "available") as ProductStatus;
  const categoryRaw = formData.get("categoryId");
  const image = formData.get("image") as File | null;

  const fieldErrors: Record<string, string> = {};
  if (name.length < 2) fieldErrors.name = "اسم المادة مطلوب";
  if (!Number.isFinite(quantity) || quantity < 0) fieldErrors.quantity = "كمية غير صالحة";
  if (!Number.isFinite(price) || price <= 0) fieldErrors.price = "سعر غير صالح";
  if (!VALID_STATUS.includes(statusRaw)) fieldErrors.status = "حالة غير صالحة";
  if (Object.keys(fieldErrors).length) return { fieldErrors };

  const categoryId =
    categoryRaw && String(categoryRaw) !== "" ? Number(categoryRaw) : null;

  // الصورة اختيارية عند التعديل — تُحدَّث فقط إن رُفعت صورة جديدة
  let imageUrl: string | null = null;
  try {
    imageUrl = await saveUploadedFile(image, "products", { allowedExt: IMAGE_EXT });
  } catch {
    return { error: "تعذّر رفع الصورة. حاول مجدداً." };
  }

  await prisma.product.update({
    where: { id },
    data: {
      name,
      quantity,
      price,
      status: statusRaw,
      categoryId,
      ...(imageUrl ? { imageUrl } : {}),
    },
  });

  revalidatePath("/dashboard/store/products");
  revalidateStoreCache();
  revalidatePath("/store");
  return { success: `تم تحديث المادة «${name}».` };
}

export async function deleteCategoryAction(formData: FormData) {
  await requirePermission("canManageProducts");
  const id = getId(formData, "categoryId");
  if (id === null) return;
  // علاقة المنتجات بالقسم اختيارية (SetNull) — حذف القسم يفصل منتجاته دون حذفها
  try {
    await prisma.category.delete({ where: { id } });
  } catch {
    // تجاهل بهدوء إن تعذّر الحذف
  }
  revalidatePath("/dashboard/store/categories");
  revalidatePath("/dashboard/store/products");
  revalidateStoreCache();
  revalidatePath("/store");
}

export async function deleteProductAction(formData: FormData) {
  await requirePermission("canManageProducts");
  const id = getId(formData, "productId");
  if (id === null) return;
  // حذف آمن: لا يُحذف إن كان مرتبطاً بطلبات (FK Restrict) — نلتقط الخطأ
  try {
    await prisma.product.delete({ where: { id } });
  } catch {
    // مرتبط بطلب — نكتفي بتعليمه نافذاً
    await prisma.product.update({
      where: { id },
      data: { status: "out_of_stock", quantity: 0 },
    });
  }
  revalidatePath("/dashboard/store/products");
  revalidateStoreCache();
  revalidatePath("/store");
}
