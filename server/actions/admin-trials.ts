"use server";

// تغيير حالة طلب نسخة تجريبية (لوحة المحتوى).
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/guards";
import { getId } from "@/lib/form";
import type { TrialRequestStatus } from "@/lib/generated/prisma";

const VALID: TrialRequestStatus[] = ["pending", "responded", "rejected"];

export async function updateTrialStatusAction(formData: FormData) {
  await requirePermission("canManageContent");

  const id = getId(formData, "trialId");
  const status = String(formData.get("status")) as TrialRequestStatus;
  if (id === null || !VALID.includes(status)) return;

  await prisma.trialRequest.update({ where: { id }, data: { status } });
  revalidatePath("/dashboard/content/trials");
  revalidatePath(`/dashboard/content/trials/${id}`);
}
