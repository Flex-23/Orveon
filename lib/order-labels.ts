// تسميات حالات الطلب والدفع بالعربية.
import type {
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
  ReservationStatus,
  TrialRequestStatus,
  ProjectRequestStatus,
} from "@/lib/generated/prisma";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "قيد الانتظار",
  processing: "قيد المعالجة",
  shipping: "قيد التوصيل",
  delivered: "تم التوصيل",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: "قيد الانتظار",
  paid: "مدفوع",
  failed: "فشل",
  refunded: "مُسترجع",
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  online: "دفع أونلاين",
  cash_on_delivery: "توصيل (عند الاستلام)",
};

export const RESERVATION_STATUS_LABELS: Record<ReservationStatus, string> = {
  pending: "قيد الانتظار",
  confirmed: "مؤكّد",
  cancelled: "ملغى",
  fulfilled: "تم التنفيذ",
};

export const RESERVATION_STATUS_BADGE: Record<ReservationStatus, string> = {
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300",
  confirmed: "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300",
  fulfilled: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300",
};

export const ORDER_STATUS_BADGE: Record<OrderStatus, string> = {
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300",
  processing: "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300",
  shipping: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300",
  delivered: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300",
};

// نقاط حالة ملوّنة لمسح القائمة بصرياً بسرعة وراحة.
export const ORDER_STATUS_DOT: Record<OrderStatus, string> = {
  pending: "bg-amber-500",
  processing: "bg-blue-500",
  shipping: "bg-indigo-500",
  delivered: "bg-emerald-500",
};

export const RESERVATION_STATUS_DOT: Record<ReservationStatus, string> = {
  pending: "bg-amber-500",
  confirmed: "bg-blue-500",
  cancelled: "bg-red-500",
  fulfilled: "bg-emerald-500",
};

export const PAYMENT_STATUS_BADGE: Record<PaymentStatus, string> = {
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300",
  paid: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300",
  failed: "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300",
  refunded: "bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
};

// --- طلبات النسخ التجريبية ---
export const TRIAL_STATUS_LABELS: Record<TrialRequestStatus, string> = {
  pending: "قيد الانتظار",
  responded: "تمت الاستجابة",
  rejected: "مرفوض",
};

export const TRIAL_STATUS_BADGE: Record<TrialRequestStatus, string> = {
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300",
  responded: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300",
  rejected: "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300",
};

export const TRIAL_STATUS_DOT: Record<TrialRequestStatus, string> = {
  pending: "bg-amber-500",
  responded: "bg-emerald-500",
  rejected: "bg-red-500",
};

// --- طلبات المشاريع (ابدأ مشروعك) ---
export const PROJECT_STATUS_LABELS: Record<ProjectRequestStatus, string> = {
  pending: "قيد الانتظار",
  reviewing: "قيد المراجعة",
  approved: "تمت الموافقة",
  in_progress: "قيد التنفيذ",
  completed: "مكتمل",
  rejected: "مرفوض",
};

export const PROJECT_STATUS_BADGE: Record<ProjectRequestStatus, string> = {
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300",
  reviewing: "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300",
  approved: "bg-teal-100 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300",
  in_progress: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300",
  completed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300",
  rejected: "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300",
};

export const PROJECT_STATUS_DOT: Record<ProjectRequestStatus, string> = {
  pending: "bg-amber-500",
  reviewing: "bg-blue-500",
  approved: "bg-teal-500",
  in_progress: "bg-indigo-500",
  completed: "bg-emerald-500",
  rejected: "bg-red-500",
};
