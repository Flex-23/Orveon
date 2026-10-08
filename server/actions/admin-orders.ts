"use server";

// تغيير حالة الطلب وحالة الدفع (لوحة المتجر).
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/guards";
import { getId } from "@/lib/form";
import type { OrderStatus, PaymentStatus } from "@/lib/generated/prisma";

const ORDER_STATUSES: OrderStatus[] = ["pending", "processing", "shipping", "delivered"];
const PAYMENT_STATUSES: PaymentStatus[] = ["pending", "paid", "failed", "refunded"];

export async function updateOrderStatusAction(formData: FormData) {
  await requirePermission("canManageOrders");
  const id = getId(formData, "orderId");
  const status = String(formData.get("orderStatus")) as OrderStatus;
  if (id === null || !ORDER_STATUSES.includes(status)) return;

  await prisma.order.update({ where: { id }, data: { orderStatus: status } });
  revalidatePath("/dashboard/store/orders");
  revalidatePath(`/dashboard/store/orders/${id}`);
}

export async function updatePaymentStatusAction(formData: FormData) {
  await requirePermission("canManageOrders");
  const id = getId(formData, "orderId");
  const status = String(formData.get("paymentStatus")) as PaymentStatus;
  if (id === null || !PAYMENT_STATUSES.includes(status)) return;

  await prisma.order.update({ where: { id }, data: { paymentStatus: status } });
  revalidatePath("/dashboard/store/orders");
  revalidatePath(`/dashboard/store/orders/${id}`);
}
