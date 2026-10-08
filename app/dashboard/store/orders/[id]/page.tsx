import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { requirePermission } from "@/lib/auth/guards";
import { getOrderByIdAdmin } from "@/server/queries/admin";
import {
  updateOrderStatusAction,
  updatePaymentStatusAction,
} from "@/server/actions/admin-orders";
import { formatPrice, formatDateTime } from "@/lib/format";
import {
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
} from "@/lib/order-labels";
import { StatusSelect } from "@/components/dashboard/status-select";

export default async function OrderDetailAdminPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePermission("canManageOrders");
  const { id } = await params;
  const order = await getOrderByIdAdmin(Number(id));
  if (!order) notFound();

  const orderStatusOptions = Object.entries(ORDER_STATUS_LABELS).map(
    ([value, label]) => ({ value, label }),
  );
  const paymentStatusOptions = Object.entries(PAYMENT_STATUS_LABELS).map(
    ([value, label]) => ({ value, label }),
  );

  return (
    <main className="max-w-3xl">
      <Link
        href="/dashboard/store/orders"
        className="mb-4 inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-indigo-600"
      >
        <ArrowRight className="h-4 w-4" />
        كل الطلبات
      </Link>

      <h1 className="mb-6 text-2xl font-bold">طلب #{order.id}</h1>

      {/* العناصر */}
      <div className="rounded-2xl border border-black/10 p-5 dark:border-white/10">
        <h2 className="mb-3 font-semibold">العناصر</h2>
        <ul className="flex flex-col gap-2">
          {order.items.map((i) => (
            <li key={i.id} className="flex justify-between gap-2 text-sm">
              <span>{i.product.name} <span className="text-zinc-500">×{i.quantity}</span></span>
              <span className="font-medium">{formatPrice(Number(i.unitPrice) * i.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex justify-between border-t border-black/10 pt-3 font-bold dark:border-white/10">
          <span>الإجمالي</span>
          <span className="text-indigo-600 dark:text-indigo-400">{formatPrice(order.total.toString())}</span>
        </div>
      </div>

      {/* الزبون والتوصيل */}
      <div className="mt-5 grid gap-4 rounded-2xl border border-black/10 p-5 dark:border-white/10 sm:grid-cols-2">
        <Detail label="الزبون" value={order.user.name} />
        <Detail label="رقم الزبون" value={order.user.phone} />
        <Detail label="طريقة الدفع" value={PAYMENT_METHOD_LABELS[order.paymentMethod]} />
        <Detail label="تاريخ الطلب" value={formatDateTime(order.createdAt)} />
        {order.paymentMethod === "cash_on_delivery" && (
          <>
            <Detail label="المحافظة" value={order.governorate ?? "—"} />
            <Detail label="العنوان" value={order.address ?? "—"} />
            <Detail label="أقرب نقطة دالة" value={order.nearestLandmark ?? "—"} />
          </>
        )}
      </div>

      {/* تغيير الحالات */}
      <div className="mt-5 grid gap-6 rounded-2xl border border-black/10 p-5 dark:border-white/10 sm:grid-cols-2">
        <div>
          <h3 className="mb-2 text-sm font-semibold">حالة الطلب</h3>
          <StatusSelect
            action={updateOrderStatusAction}
            idName="orderId"
            idValue={order.id}
            name="orderStatus"
            value={order.orderStatus}
            options={orderStatusOptions}
          />
        </div>
        <div>
          <h3 className="mb-2 text-sm font-semibold">حالة الدفع</h3>
          <StatusSelect
            action={updatePaymentStatusAction}
            idName="orderId"
            idValue={order.id}
            name="paymentStatus"
            value={order.paymentStatus}
            options={paymentStatusOptions}
          />
        </div>
      </div>
    </main>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-sm text-zinc-500">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
