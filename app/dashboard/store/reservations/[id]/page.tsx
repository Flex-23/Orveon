import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { requirePermission } from "@/lib/auth/guards";
import { getReservationById } from "@/server/queries/admin";
import { updateReservationStatusAction } from "@/server/actions/admin-reservations";
import { formatPrice, formatDateTime } from "@/lib/format";
import { RESERVATION_STATUS_LABELS } from "@/lib/order-labels";
import { StatusSelect } from "@/components/dashboard/status-select";

export default async function ReservationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePermission("canManageReservations");
  const { id } = await params;
  const reservation = await getReservationById(Number(id));
  if (!reservation) notFound();

  const statusOptions = Object.entries(RESERVATION_STATUS_LABELS).map(
    ([value, label]) => ({ value, label }),
  );

  return (
    <main className="max-w-2xl">
      <Link
        href="/dashboard/store/reservations"
        className="mb-4 inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-indigo-600"
      >
        <ArrowRight className="h-4 w-4" />
        كل الحجوزات
      </Link>

      <h1 className="mb-6 text-2xl font-bold">حجز #{reservation.id}</h1>

      <div className="grid gap-4 rounded-2xl border border-black/10 p-6 dark:border-white/10 sm:grid-cols-2">
        <Detail label="اسم الشخص" value={reservation.name ?? reservation.user?.name ?? "—"} />
        <Detail label="رقم الهاتف" value={reservation.phone ?? reservation.user?.phone ?? "—"} />
        <Detail label="المادة" value={reservation.product.name} />
        <Detail label="الكمية" value={String(reservation.quantity)} />
        <Detail label="السعر" value={formatPrice(reservation.price.toString())} />
        <Detail label="المحافظة" value={reservation.governorate ?? "—"} />
        <Detail label="أقرب نقطة دالة" value={reservation.nearestLandmark ?? "—"} />
        <Detail
          label="تاريخ الحجز"
          value={formatDateTime(reservation.createdAt)}
        />
        <Detail label="ملاحظات" value={reservation.details ?? "—"} />
      </div>

      <div className="mt-6 rounded-2xl border border-black/10 p-6 dark:border-white/10">
        <h2 className="mb-3 font-semibold">تغيير الحالة</h2>
        <StatusSelect
          action={updateReservationStatusAction}
          idName="reservationId"
          idValue={reservation.id}
          name="status"
          value={reservation.status}
          options={statusOptions}
        />
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
