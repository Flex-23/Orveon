import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requirePermission } from "@/lib/auth/guards";
import { getAllOrders } from "@/server/queries/admin";
import { formatPrice } from "@/lib/format";
import { DataList, DataRow, DataCell } from "@/components/dashboard/data-list";
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_BADGE,
  ORDER_STATUS_DOT,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_BADGE,
  PAYMENT_METHOD_LABELS,
} from "@/lib/order-labels";

export const metadata = { title: "الطلبات | Orvion" };

const COLS = "0.5fr minmax(0,1.5fr) 0.9fr 1fr 1fr 1.1fr auto";

export default async function OrdersAdminPage() {
  await requirePermission("canManageOrders");
  const orders = await getAllOrders();

  return (
    <main>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">الطلبات</h1>
        <p className="mt-1.5 text-sm text-muted sm:text-base">
          {orders.length} طلب — اضغط على أي طلب لعرض تفاصيله.
        </p>
      </div>

      {orders.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line p-10 text-center text-muted">
          لا توجد طلبات.
        </p>
      ) : (
        <DataList
          cols={COLS}
          headers={["#", "الزبون", "الإجمالي", "طريقة الدفع", "حالة الدفع", "حالة الطلب", ""]}
        >
          {orders.map((o) => (
            <DataRow key={o.id} cols={COLS}>
              {/* # */}
              <DataCell label="رقم الطلب">
                <span className="tabular font-semibold text-muted">#{o.id}</span>
              </DataCell>

              {/* الزبون */}
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/10 text-xs font-bold text-accent-strong">
                  {o.user.name.charAt(0)}
                </span>
                <span className="truncate font-semibold">{o.user.name}</span>
              </div>

              {/* الإجمالي */}
              <DataCell label="الإجمالي">
                <span className="tabular font-semibold">{formatPrice(o.total.toString())}</span>
              </DataCell>

              {/* طريقة الدفع */}
              <DataCell label="طريقة الدفع">
                <span className="text-muted">{PAYMENT_METHOD_LABELS[o.paymentMethod]}</span>
              </DataCell>

              {/* حالة الدفع */}
              <DataCell label="حالة الدفع">
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${PAYMENT_STATUS_BADGE[o.paymentStatus]}`}>
                  {PAYMENT_STATUS_LABELS[o.paymentStatus]}
                </span>
              </DataCell>

              {/* حالة الطلب */}
              <DataCell label="حالة الطلب">
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${ORDER_STATUS_BADGE[o.orderStatus]}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${ORDER_STATUS_DOT[o.orderStatus]}`} />
                  {ORDER_STATUS_LABELS[o.orderStatus]}
                </span>
              </DataCell>

              {/* التفاصيل */}
              <div className="border-t border-line pt-3 md:border-0 md:pt-0 md:text-end">
                <Link
                  href={`/dashboard/store/orders/${o.id}`}
                  className="inline-flex w-full items-center justify-center gap-1 rounded-lg border border-line px-3 py-2 text-sm font-medium text-accent-strong transition-colors hover:bg-accent/10 md:w-auto md:py-1.5"
                >
                  التفاصيل
                  <ArrowLeft className="h-3.5 w-3.5" />
                </Link>
              </div>
            </DataRow>
          ))}
        </DataList>
      )}
    </main>
  );
}
