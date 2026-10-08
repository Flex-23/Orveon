"use server";

// تغيير حالة طلب مشروع (خانة طلبات المشاريع).
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/guards";
import { getId } from "@/lib/form";
import type { ProjectRequestStatus } from "@/lib/generated/prisma";

const VALID: ProjectRequestStatus[] = [
  "pending",
  "reviewing",
  "approved",
  "in_progress",
  "completed",
  "rejected",
];

export async function updateProjectStatusAction(formData: FormData) {
  await requirePermission("canManageProjects");

  const id = getId(formData, "projectId");
  const status = String(formData.get("status")) as ProjectRequestStatus;
  if (id === null || !VALID.includes(status)) return;

  await prisma.projectRequest.update({ where: { id }, data: { status } });
  revalidatePath("/dashboard/projects");
  revalidatePath(`/dashboard/projects/${id}`);
  // حالة الطلب تظهر للزبون في الصفحة الرئيسية أيضاً
  revalidatePath("/");
}
