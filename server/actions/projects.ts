"use server";

// طلب بدء مشروع من زر «ابدأ مشروعك» في الصفحة الرئيسية. يتطلب تسجيل الدخول.
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { projectRequestSchema } from "@/lib/validations/project";
import { fieldErrorsFromZod } from "@/lib/form";

export type ProjectState = {
  error?: string;
  success?: boolean;
  fieldErrors?: Record<string, string>;
};

export async function requestProjectAction(
  _prev: ProjectState,
  formData: FormData,
): Promise<ProjectState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/start-project");

  const parsed = projectRequestSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    governorate: formData.get("governorate") || undefined,
    description: formData.get("description"),
    duration: formData.get("duration"),
  });

  if (!parsed.success) {
    return { fieldErrors: fieldErrorsFromZod(parsed.error) };
  }

  const data = parsed.data;

  // منع تكرار طلب لم يُبتّ فيه بعد من نفس المستخدم
  const existing = await prisma.projectRequest.findFirst({
    where: { userId: user.id, status: { in: ["pending", "reviewing"] } },
  });
  if (existing) {
    return { error: "لديك طلب مشروع قيد المراجعة بالفعل — سنتواصل معك قريباً." };
  }

  await prisma.projectRequest.create({
    data: {
      userId: user.id,
      name: data.name,
      phone: data.phone,
      governorate: data.governorate ?? null,
      description: data.description,
      duration: data.duration,
      status: "pending",
    },
  });

  return { success: true };
}
