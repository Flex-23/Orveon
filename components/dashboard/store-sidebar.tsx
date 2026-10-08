"use client";

// شريط جانبي لتنقّل لوحة المتجر — روابط رئيسية (المنتجات والأقسام كلٌّ بصفحته).
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Tag,
  CalendarClock,
  ShoppingBag,
  ArrowRight,
} from "lucide-react";

export function StoreSidebar({
  canProducts,
  canReservations,
  canOrders,
}: {
  canProducts: boolean;
  canReservations: boolean;
  canOrders: boolean;
}) {
  const pathname = usePathname();

  const links = [
    { href: "/dashboard/store", label: "نظرة عامة", icon: LayoutDashboard, show: true, exact: true },
    { href: "/dashboard/store/products", label: "المنتجات", icon: Package, show: canProducts },
    { href: "/dashboard/store/categories", label: "الأقسام", icon: Tag, show: canProducts },
    { href: "/dashboard/store/reservations", label: "الحجوزات", icon: CalendarClock, show: canReservations },
    { href: "/dashboard/store/orders", label: "الطلبات", icon: ShoppingBag, show: canOrders },
  ].filter((l) => l.show);

  return (
    <nav className="flex flex-col gap-1">
      <Link
        href="/dashboard"
        className="mb-2 flex items-center gap-2 px-3 py-2 text-sm text-muted transition-colors hover:text-accent-strong"
      >
        <ArrowRight className="h-4 w-4" />
        كل اللوحات
      </Link>

      {links.map(({ href, label, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              active
                ? "bg-accent-strong text-(--accent-contrast) shadow-sm shadow-accent-strong/30"
                : "hover:bg-foreground/5"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
