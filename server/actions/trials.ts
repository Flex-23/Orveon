"use server";

// طلب نسخة تجريبية لعمل معروض في الصفحة الرئيسية. يتطلب تسجيل الدخول.
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { trialRequestSchema } from "@/lib/validations/trial";
import { fieldErrorsFromZod } from "@/lib/form";

export type TrialState = {
  error?: string;
  success?: boolean;
  fieldErrors?: Record<string, string>;
};

export async function requestTrialAction(
  _prev: TrialState,
  formData: FormData,
): Promise<TrialState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/#works");

  const parsed = trialRequestSchema.safeParse({
    workId: formData.get("workId"),
    name: formData.get("name"),
    phone: formData.get("phone"),
    governorate: formData.get("governorate") || undefined,
    details: formData.get("details") || undefined,
  });

  if (!parsed.success) {
    return { fieldErrors: fieldErrorsFromZod(parsed.error) };
  }

  const data = parsed.data;

  const work = await prisma.work.findUnique({ where: { id: data.workId } });
  if (!work) {
    return { error: "هذا العمل غير متاح حالياً." };
  }

  // منع تكرار طلب قيد الانتظار لنفس العمل من نفس المستخدم
  const existing = await prisma.trialRequest.findFirst({
    where: { userId: user.id, workId: data.workId, status: "pending" },
  });
  if (existing) {
    return { error: "لديك طلب قيد الانتظار لهذا العمل بالفعل." };
  }

  await prisma.trialRequest.create({
    data: {
      userId: user.id,
      workId: work.id,
      workTitle: work.title,
      name: data.name,
      phone: data.phone,
      governorate: data.governorate ?? null,
      details: data.details ?? null,
      status: "pending",
    },
  });

  return { success: true };
}
