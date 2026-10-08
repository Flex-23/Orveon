import Link from "next/link";
import {
  Package,
  Layers,
  ShoppingBag,
  Clock,
  CalendarClock,
  Sparkles,
  Ban,
  TrendingUp,
  Wallet,
  ArrowLeft,
} from "lucide-react";
import { requireStaff } from "@/lib/auth/guards";
import { getStoreStats } from "@/server/queries/dashboard";
import { formatPrice } from "@/lib/format";

export const metadata = { title: "نظرة عامة — لوحة المتجر | Orvion" };

export default async function StoreOverview() {
  await requireStaff();
  const s = await getStoreStats();

  // البطاقتان البارزتان (المال)
  const heroes = [
    {
      label: "إجمالي المبيعات",
      value: formatPrice(s.totalSales),
      icon: TrendingUp,
      tint: "bg-accent/10 text-accent-strong",
      caption: "مجموع قيمة كل الطلبات",
    },
    {
      label: "الأرباح المحقّقة",
      value: formatPrice(s.realizedProfit),
      icon: Wallet,
      tint: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
      caption: "من الطلبات المكتملة (تم التوصيل)",
    },
  ];

  // البطاقات التفصيلية
  const tiles = [
    { label: "عدد المنتجات", value: s.productsCount, icon: Package, tint: "bg-blue-500/10 text-blue-600 dark:text-blue-400", href: "/dashboard/store/products" },
    { label: "عدد الأقسام", value: s.categoriesCount, icon: Layers, tint: "bg-violet-500/10 text-violet-600 dark:text-violet-400", href: "/dashboard/store/products" },
    { label: "إجمالي الطلبات", value: s.ordersCount, icon: ShoppingBag, tint: "bg-sky-500/10 text-sky-600 dark:text-sky-400", href: "/dashboard/store/orders" },
    { label: "طلبات قيد الانتظار", value: s.pendingOrders, icon: Clock, tint: "bg-amber-500/10 text-amber-600 dark:text-amber-400", href: "/dashboard/store/orders" },
    { label: "حجوزات قيد الانتظار", value: s.pendingReservations, icon: CalendarClock, tint: "bg-rose-500/10 text-rose-600 dark:text-rose-400", href: "/dashboard/store/reservations" },
    { label: "طلبات تجريبية قيد الانتظار", value: s.pendingTrials, icon: Sparkles, tint: "bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400", href: "/dashboard/content/trials" },
    { label: "منتجات نافذة", value: s.outOfStock, icon: Ban, tint: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400", href: "/dashboard/store/products" },
  ];

  return (
    <main className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">نظرة عامة على المتجر</h1>
        <p className="mt-1.5 text-muted">ملخّص أداء متجرك في لمحة واحدة.</p>
      </div>

      {/* البطاقتان البارزتان */}
      <div className="grid gap-5 sm:grid-cols-2">
        {heroes.map(({ label, value, icon: Icon, tint, caption }) => (
          <div
            key={label}
            className="rounded-2xl border border-line bg-panel p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted">{label}</p>
              <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${tint}`}>
                <Icon className="h-5 w-5" />
              </span>
            </div>
            <p className="tabular mt-4 text-4xl font-black tracking-tight">{value}</p>
            <p className="mt-2 text-xs text-muted">{caption}</p>
          </div>
        ))}
      </div>

      {/* البطاقات التفصيلية */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {tiles.map(({ label, value, icon: Icon, tint, href }) => (
          <Link
            key={label}
            href={href}
            className="group rounded-2xl border border-line bg-panel p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-md"
          >
            <span className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg ${tint}`}>
              <Icon className="h-5 w-5" />
            </span>
            <p className="tabular text-2xl font-bold tracking-tight">{value}</p>
            <p className="mt-1 flex items-center gap-1 text-sm text-muted">
              {label}
              <ArrowLeft className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
            </p>
          </Link>
        ))}
      </div>
    </main>
  );
}
