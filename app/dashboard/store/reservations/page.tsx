import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requirePermission } from "@/lib/auth/guards";
import { getAllReservations } from "@/server/queries/admin";
import { formatPrice } from "@/lib/format";
import { DataList, DataRow, DataCell } from "@/components/dashboard/data-list";
import {
  RESERVATION_STATUS_LABELS,
  RESERVATION_STATUS_BADGE,
  RESERVATION_STATUS_DOT,
} from "@/lib/order-labels";

export const metadata = { title: "الحجوزات | Orvion" };

const COLS = "minmax(0,1.5fr) minmax(0,1.4fr) 0.9fr 1fr auto";

export default async function ReservationsAdminPage() {
  await requirePermission("canManageReservations");
  const reservations = await getAllReservations();

  return (
    <main>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">الحجوزات</h1>
        <p className="mt-1.5 text-sm text-muted sm:text-base">
          {reservations.length} حجز — اضغط على أي حجز لعرض تفاصيله.
        </p>
      </div>

      {reservations.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line p-10 text-center text-muted">
          لا توجد حجوزات.
        </p>
      ) : (
        <DataList cols={COLS} headers={["الاسم", "المادة", "السعر", "الحالة", ""]}>
          {reservations.map((r) => {
            const name = r.name ?? r.user?.name ?? "—";
            return (
              <DataRow key={r.id} cols={COLS}>
                {/* الاسم */}
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/10 text-xs font-bold text-accent-strong">
                    {name.charAt(0)}
                  </span>
                  <span className="truncate font-semibold">{name}</span>
                </div>

                {/* المادة */}
                <DataCell label="المادة">
                  <span className="text-muted">{r.product.name}</span>
                </DataCell>

                {/* السعر */}
                <DataCell label="السعر">
                  <span className="tabular font-semibold">{formatPrice(r.price.toString())}</span>
                </DataCell>

                {/* الحالة */}
                <DataCell label="الحالة">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${RESERVATION_STATUS_BADGE[r.status]}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${RESERVATION_STATUS_DOT[r.status]}`} />
                    {RESERVATION_STATUS_LABELS[r.status]}
                  </span>
                </DataCell>

                {/* التفاصيل */}
                <div className="border-t border-line pt-3 md:border-0 md:pt-0 md:text-end">
                  <Link
                    href={`/dashboard/store/reservations/${r.id}`}
                    className="inline-flex w-full items-center justify-center gap-1 rounded-lg border border-line px-3 py-2 text-sm font-medium text-accent-strong transition-colors hover:bg-accent/10 md:w-auto md:py-1.5"
                  >
                    التفاصيل
                    <ArrowLeft className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </DataRow>
            );
          })}
        </DataList>
      )}
    </main>
  );
}
