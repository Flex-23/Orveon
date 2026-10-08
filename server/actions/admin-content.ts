"use server";

// إجراءات إدارة محتوى الصفحة الرئيسية (الأعمال والخدمات).
import { revalidatePath, revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/guards";
import { saveUploadedFile, IMAGE_EXT, VIDEO_EXT, DOC_EXT } from "@/lib/storage";
import { getId } from "@/lib/form";

// إبطال كاش الاستعلامات العامة المُخزَّنة (unstable_cache) في server/queries/content.ts
function revalidateWorksCache() {
  revalidateTag("works", "max");
}
function revalidateServicesCache() {
  revalidateTag("services", "max");
}

export type ContentActionState = {
  error?: string;
  success?: string;
  fieldErrors?: Record<string, string>;
  // القيم المُدخَلة تُعاد عند الخطأ لإبقاء الحقول معبّأة (لا يُفرّغ النموذج).
  values?: Record<string, string>;
};

function stripExt(name: string): string {
  return name.replace(/\.[^.]+$/, "");
}

// ---------------------- الأعمال ----------------------

export async function createWorkAction(
  _prev: ContentActionState,
  formData: FormData,
): Promise<ContentActionState> {
  await requirePermission("canManageContent");

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const image = formData.get("image") as File | null;
  const values = { title, description };

  if (title.length < 2) return { fieldErrors: { title: "العنوان مطلوب" }, values };

  let imageUrl: string | null = null;
  try {
    imageUrl = await saveUploadedFile(image, "works");
  } catch {
    return { error: "تعذّر رفع الصورة.", values };
  }

  await prisma.work.create({
    data: { title, description: description || null, imageUrl },
  });

  revalidateWorksCache();
  revalidatePath("/dashboard/content/works");
  revalidatePath("/");
  return { success: `تم إضافة العمل «${title}».` };
}

export async function updateWorkAction(
  _prev: ContentActionState,
  formData: FormData,
): Promise<ContentActionState> {
  await requirePermission("canManageContent");

  const id = getId(formData, "workId");
  if (id === null) return { error: "معرّف العمل غير صالح." };

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const image = formData.get("image") as File | null;

  if (title.length < 2) return { fieldErrors: { title: "العنوان مطلوب" } };

  // الصورة اختيارية — تُستبدل فقط إن رُفعت صورة جديدة
  let imageUrl: string | null = null;
  try {
    imageUrl = await saveUploadedFile(image, "works");
  } catch {
    return { error: "تعذّر رفع الصورة." };
  }

  await prisma.work.update({
    where: { id },
    data: {
      title,
      description: description || null,
      ...(imageUrl ? { imageUrl } : {}),
    },
  });

  revalidateWorksCache();
  revalidatePath("/dashboard/content/works");
  revalidatePath(`/dashboard/content/works/${id}`);
  revalidatePath("/");
  return { success: `تم تحديث العمل «${title}».` };
}

export async function deleteWorkAction(formData: FormData) {
  await requirePermission("canManageContent");
  const id = getId(formData, "workId");
  if (id === null) return;
  await prisma.work.delete({ where: { id } });
  revalidateWorksCache();
  revalidatePath("/dashboard/content/works");
  revalidatePath("/");
}

// ---------------------- الخدمات ----------------------

export async function createServiceAction(
  _prev: ContentActionState,
  formData: FormData,
): Promise<ContentActionState> {
  await requirePermission("canManageContent");

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const values = { title, description };
  if (title.length < 2) return { fieldErrors: { title: "عنوان الخدمة مطلوب" }, values };

  try {
    // الملف المضغوط للتحميل
    const downloadFile = formData.get("downloadFile") as File | null;
    const downloadFileUrl = await saveUploadedFile(downloadFile, "services/files", {
      allowedExt: DOC_EXT,
    });

    // صورة واجهة الكارد (واحدة)
    const image = formData.get("image") as File | null;
    const coverUrl = await saveUploadedFile(image, "services/images", {
      allowedExt: IMAGE_EXT,
    });

    // الفيديوهات (متعددة)
    const videoFiles = formData.getAll("videos") as File[];
    const videoData: { videoUrl: string; title: string }[] = [];
    for (const v of videoFiles) {
      const url = await saveUploadedFile(v, "services/videos", {
        allowedExt: VIDEO_EXT,
      });
      if (url) videoData.push({ videoUrl: url, title: stripExt(v.name) });
    }

    await prisma.service.create({
      data: {
        title,
        description: description || null,
        downloadFileUrl,
        images: coverUrl ? { create: [{ imageUrl: coverUrl }] } : undefined,
        videos: { create: videoData },
      },
    });
  } catch {
    return { error: "تعذّر حفظ الخدمة أو رفع الملفات.", values };
  }

  revalidateServicesCache();
  revalidatePath("/dashboard/content/services");
  revalidatePath("/services");
  revalidatePath("/");
  return { success: `تم إضافة الخدمة «${title}».` };
}

export async function updateServiceAction(
  _prev: ContentActionState,
  formData: FormData,
): Promise<ContentActionState> {
  await requirePermission("canManageContent");

  const id = getId(formData, "serviceId");
  if (id === null) return { error: "معرّف الخدمة غير صالح." };

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  if (title.length < 2) return { fieldErrors: { title: "عنوان الخدمة مطلوب" } };

  try {
    // ملف تحميل جديد (اختياري) — يستبدل القديم إن رُفع
    const downloadFile = formData.get("downloadFile") as File | null;
    const downloadFileUrl = await saveUploadedFile(downloadFile, "services/files", {
      allowedExt: DOC_EXT,
    });

    // صورة واجهة جديدة (اختياري) — تستبدل الصورة الحالية بالكامل
    const image = formData.get("image") as File | null;
    const coverUrl = await saveUploadedFile(image, "services/images", {
      allowedExt: IMAGE_EXT,
    });

    // فيديوهات جديدة تُضاف للموجود (اختياري)
    const videoFiles = formData.getAll("videos") as File[];
    const newVideoData: { videoUrl: string; title: string }[] = [];
    for (const v of videoFiles) {
      const url = await saveUploadedFile(v, "services/videos", {
        allowedExt: VIDEO_EXT,
      });
      if (url) newVideoData.push({ videoUrl: url, title: stripExt(v.name) });
    }

    await prisma.service.update({
      where: { id },
      data: {
        title,
        description: description || null,
        ...(downloadFileUrl ? { downloadFileUrl } : {}),
        ...(coverUrl
          ? { images: { deleteMany: {}, create: [{ imageUrl: coverUrl }] } }
          : {}),
        ...(newVideoData.length ? { videos: { create: newVideoData } } : {}),
      },
    });
  } catch {
    return { error: "تعذّر تحديث الخدمة أو رفع الملفات." };
  }

  revalidateServicesCache();
  revalidatePath("/dashboard/content/services");
  revalidatePath(`/dashboard/content/services/${id}`);
  revalidatePath("/services");
  revalidatePath("/");
  return { success: `تم تحديث الخدمة «${title}».` };
}

export async function deleteServiceImageAction(formData: FormData) {
  await requirePermission("canManageContent");
  const id = getId(formData, "imageId");
  if (id === null) return;
  await prisma.serviceImage.delete({ where: { id } });
  revalidateServicesCache();
  revalidatePath("/dashboard/content/services");
  revalidatePath("/services");
  revalidatePath("/");
}

export async function deleteServiceVideoAction(formData: FormData) {
  await requirePermission("canManageContent");
  const id = getId(formData, "videoId");
  if (id === null) return;
  const serviceId = getId(formData, "serviceId");
  await prisma.serviceVideo.delete({ where: { id } });
  revalidateServicesCache();
  revalidatePath("/dashboard/content/services");
  if (serviceId !== null) revalidatePath(`/dashboard/content/services/${serviceId}`);
  revalidatePath("/services");
  revalidatePath("/");
}

export async function deleteServiceAction(formData: FormData) {
  await requirePermission("canManageContent");
  const id = getId(formData, "serviceId");
  if (id === null) return;
  await prisma.service.delete({ where: { id } }); // الصور/الفيديوهات تُحذف بالـ Cascade
  revalidateServicesCache();
  revalidatePath("/dashboard/content/services");
  revalidatePath("/services");
  revalidatePath("/");
}
