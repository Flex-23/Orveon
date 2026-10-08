"use server";

// تغيير حالة الحجز (لوحة المتجر).
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/guards";
import { getId } from "@/lib/form";
import type { ReservationStatus } from "@/lib/generated/prisma";

const VALID: ReservationStatus[] = ["pending", "confirmed", "cancelled", "fulfilled"];

export async function updateReservationStatusAction(formData: FormData) {
  await requirePermission("canManageReservations");

  const id = getId(formData, "reservationId");
  const status = String(formData.get("status")) as ReservationStatus;
  if (id === null || !VALID.includes(status)) return;

  await prisma.reservation.update({ where: { id }, data: { status } });
  revalidatePath("/dashboard/store/reservations");
  revalidatePath(`/dashboard/store/reservations/${id}`);
}
