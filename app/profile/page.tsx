import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Package,
  CalendarClock,
  FileArchive,
  Download,
  ShoppingBag,
  ArrowLeft,
  Phone,
  MapPin,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth/session";
import { getUserOrders } from "@/server/queries/orders";
import { getUserReservations } from "@/server/queries/reservations";
import { getMemberPrograms } from "@/server/queries/manager";
import { formatPrice, formatDate } from "@/lib/format";
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_BADGE,
  ORDER_STATUS_DOT,
  RESERVATION_STATUS_LABELS,
  RESERVATION_STATUS_BADGE,
  RESERVATION_STATUS_DOT,
} from "@/lib/order-labels";
import { LogoutButton } from "@/components/auth/logout-button";

export const metadata = { title: "حسابي | Orvion" };

const ROLE_LABELS: Record<string, string> = {
  visitor: "زائر",
  member: "عضو / مشترك",
  admin: "أدمن",
  manager: "مدير",
};

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [orders, reservations, programs] = await Promise.all([
    getUserOrders(user.id),
    getUserReservations(user.id),
    getMemberPrograms(user.id),
  ]);

  const showFiles = user.role === "member" || programs.length > 0;

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-12">
      {/* رأس البطاقة */}
      <header className="flex flex-col gap-5 rounded-2xl border border-border bg-surface p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-accent/10 text-2xl font-black text-accent-strong">
            {user.name.charAt(0)}
          </span>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight">{user.name}</h1>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
              <span className="inline-flex items-center gap-1.5" dir="ltr">
                <Phone className="h-3.5 w-3.5" />
                {user.phone}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                {user.governorate ?? "—"}
              </span>
              <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-semibold text-accent-strong">
                {ROLE_LABELS[user.role] ?? user.role}
              </span>
            </div>
          </div>
        </div>
        <LogoutButton />
      </header>

      {/* إحصاء سريع */}
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Stat icon={Package} value={orders.length} label="الطلبات" />
        <Stat icon={CalendarClock} value={reservations.length} label="الحجوزات" />
        {showFiles && (
          <Stat icon={FileArchive} value={programs.length} label="ملفاتي" />
        )}
      </div>

      {/* الطلبات */}
      <section className="mt-10">
        <SectionTitle icon={Package} title="الطلبات" count={orders.length} />
        {orders.length === 0 ? (
          <EmptyState text="لا توجد طلبات بعد." cta />
        ) : (
          <ul className="flex flex-col gap-3">
            {orders.map((order) => (
              <li key={order.id}>
                <Link
                  href={`/orders/${order.id}`}
                  className="group flex items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-4 transition-colors hover:border-accent/30"
                >
                  <div className="min-w-0">
                    <p className="font-semibold">طلب #{order.id}</p>
                    <p className="mt-0.5 text-sm text-muted">
                      {order.items.length} عنصر · {formatPrice(order.total.toString())} ·{" "}
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${ORDER_STATUS_BADGE[order.orderStatus]}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${ORDER_STATUS_DOT[order.orderStatus]}`} />
                      {ORDER_STATUS_LABELS[order.orderStatus]}
                    </span>
                    <ArrowLeft className="h-4 w-4 text-muted transition-transform group-hover:-translate-x-1" />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* الحجوزات */}
      <section className="mt-10">
        <SectionTitle icon={CalendarClock} title="الحجوزات" count={reservations.length} />
        {reservations.length === 0 ? (
          <EmptyState text="لا توجد حجوزات بعد." cta />
        ) : (
          <ul className="flex flex-col gap-3">
            {reservations.map((r) => (
              <li
                key={r.id}
                className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-4"
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold">
                    {r.product.name}
                    {r.quantity > 1 && <span className="text-muted"> ×{r.quantity}</span>}
                  </p>
                  <p className="mt-0.5 text-sm text-muted">
                    {formatPrice(r.price.toString())} · {formatDate(r.createdAt)}
                  </p>
                </div>
                <span
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${RESERVATION_STATUS_BADGE[r.status]}`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${RESERVATION_STATUS_DOT[r.status]}`} />
                  {RESERVATION_STATUS_LABELS[r.status]}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* الملفات والخدمات المرفوعة — تخصّ المشتركين */}
      {showFiles && (
        <section className="mt-10">
          <SectionTitle icon={FileArchive} title="ملفاتي وخدماتي" count={programs.length} />
          {programs.length === 0 ? (
            <EmptyState text="لا توجد ملفات مرفوعة لك بعد. عند تجهيز خدمتك سيرفعها الفريق هنا." />
          ) : (
            <ul className="flex flex-col gap-3">
              {programs.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-4"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent-strong">
                      <FileArchive className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-medium">{p.title}</p>
                      <p className="text-xs text-muted">أُضيف في {formatDate(p.createdAt)}</p>
                    </div>
                  </div>
                  <a
                    href={`/api/member-programs/${p.id}`}
                    download
                    className="inline-flex shrink-0 items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-(--accent-contrast) transition-colors hover:bg-accent-strong"
                  >
                    <Download className="h-4 w-4" />
                    تنزيل
                  </a>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </main>
  );
}

function Stat({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof Package;
  value: number;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent-strong">
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <p className="tabular text-2xl font-bold leading-none">{value}</p>
        <p className="mt-1 text-sm text-muted">{label}</p>
      </div>
    </div>
  );
}

function SectionTitle({
  icon: Icon,
  title,
  count,
}: {
  icon: typeof Package;
  title: string;
  count: number;
}) {
  return (
    <h2 className="mb-3 flex items-center gap-2 text-lg font-bold tracking-tight">
      <Icon className="h-5 w-5 text-accent-strong" />
      {title}
      <span className="tabular text-base font-medium text-muted">({count})</span>
    </h2>
  );
}

function EmptyState({ text, cta }: { text: string; cta?: boolean }) {
  return (
    <div className="rounded-2xl border border-dashed border-border p-8 text-center">
      <p className="text-muted">{text}</p>
      {cta && (
        <Link
          href="/store"
          className="mt-3 inline-flex items-center gap-1.5 font-medium text-accent-strong hover:underline"
        >
          <ShoppingBag className="h-4 w-4" />
          تصفّح المتجر
        </Link>
      )}
    </div>
  );
}
