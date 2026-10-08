// طبقة الدفع — واجهة جاهزة للربط بمزوّد لاحقاً (المزود غير محدّد حالياً).
import type { PaymentStatus } from "@/lib/generated/prisma";

export type PaymentResult = {
  status: PaymentStatus;
  reference?: string;
  message?: string;
};

/**
 * معالجة دفعة أونلاين.
 * TODO: عند تحديد المزوّد (بوابة فيزا محلية / Stripe / ...) استبدل المحتوى
 * بنداء API الفعلي مع AUTH وتأكيد المعاملة. التوقيع يبقى كما هو حتى لا يتغيّر المستدعي.
 */
export async function processOnlinePayment(_params: {
  amount: number;
  orderRef: string;
}): Promise<PaymentResult> {
  // حالياً: لا يوجد مزوّد مربوط — نُرجع "قيد الانتظار" بانتظار ربط البوابة.
  return {
    status: "pending",
    message: "بوابة الدفع الأونلاين قيد الربط — سيُؤكَّد الدفع لاحقاً.",
  };
}
