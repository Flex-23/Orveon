import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { CheckCircle2, Package } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/session";
import { getUserOrder } from "@/server/queries/orders";
import { formatPrice } from "@/lib/format";
import {
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  ORDER_STATUS_BADGE,
} from "@/lib/order-labels";

export default async function OrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ success?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const { success } = await searchParams;
  const orderId = Number(id);
  if (!Number.isInteger(orderId)) notFound();

  const order = await getUserOrder(orderId, user.id);
  if (!order) notFound();

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-10">
      {success && (
        <div className="mb-6 flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-3 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
          <CheckCircle2 className="h-5 w-5" />
          تم استلام طلبك بنجاح! سنبدأ بمعالجته قريباً.
        </div>
      )}

      <div className="mb-6 flex items-center justify-between">
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Package className="h-6 w-6" />
          طلب #{order.id}
        </h1>
        <span
          className={`rounded-full px-3 py-1 text-sm font-semibold ${ORDER_STATUS_BADGE[order.orderStatus]}`}
        >
          {ORDER_STATUS_LABELS[order.orderStatus]}
        </span>
      </div>

      {/* العناصر */}
      <div className="rounded-2xl border border-black/10 p-5 dark:border-white/10">
        <ul className="flex flex-col gap-3">
          {order.items.map((i) => (
            <li key={i.id} className="flex justify-between gap-2 text-sm">
              <span className="min-w-0 truncate">
                {i.product.name} <span className="text-zinc-500">×{i.quantity}</span>
              </span>
              <span className="shrink-0 font-medium">
                {formatPrice(Number(i.unitPrice) * i.quantity)}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex justify-between border-t border-black/10 pt-4 font-bold dark:border-white/10">
          <span>الإجمالي</span>
          <span className="text-indigo-600 dark:text-indigo-400">
            {formatPrice(order.total.toString())}
          </span>
        </div>
      </div>

      {/* تفاصيل الدفع/التوصيل */}
      <div className="mt-5 grid gap-4 rounded-2xl border border-black/10 p-5 dark:border-white/10 sm:grid-cols-2">
        <Detail label="طريقة الدفع" value={PAYMENT_METHOD_LABELS[order.paymentMethod]} />
        <Detail label="حالة الدفع" value={PAYMENT_STATUS_LABELS[order.paymentStatus]} />
        {order.paymentMethod === "cash_on_delivery" && (
          <>
            <Detail label="اسم المستلم" value={order.deliveryName} />
            <Detail label="رقم الهاتف" value={order.deliveryPhone} />
            <Detail label="المحافظة" value={order.governorate} />
            <Detail label="العنوان" value={order.address} />
            <Detail label="أقرب نقطة دالة" value={order.nearestLandmark} />
          </>
        )}
      </div>

      <Link
        href="/profile"
        className="mt-6 inline-block font-medium text-indigo-600 hover:underline"
      >
        العودة إلى حسابي
      </Link>
    </main>
  );
}

function Detail({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <dt className="text-sm text-zinc-500">{label}</dt>
      <dd className="font-medium">{value || "—"}</dd>
    </div>
  );
}
