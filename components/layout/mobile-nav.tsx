"use client";

// تنقّل الجوال: قائمة StaggeredMenu منزلقة تستبدل الناف بار المزدحم على الشاشات الصغيرة.
import Link from "next/link";
import { LogOut } from "lucide-react";
import { logoutAction } from "@/server/actions/auth";
import { ThemeToggleIcon } from "./theme-toggle-icon";
import { StaggeredMenu, type StaggeredMenuItem } from "./staggered-menu";

export function MobileNav({
  user,
  isStaff,
  cartCount,
  className,
}: {
  user: { name: string } | null;
  isStaff: boolean;
  cartCount: number;
  className?: string;
}) {
  const items: StaggeredMenuItem[] = [
    { label: "الرئيسية", link: "/", ariaLabel: "الصفحة الرئيسية" },
    { label: "الأعمال", link: "/#works", ariaLabel: "أعمالنا" },
    { label: "الخدمات", link: "/services", ariaLabel: "خدماتنا" },
    { label: "المتجر", link: "/store", ariaLabel: "المتجر الإلكتروني" },
    { label: "حول", link: "/about", ariaLabel: "حول الشركة" },
  ];

  if (isStaff) {
    items.push({ label: "لوحة التحكم", link: "/dashboard", ariaLabel: "لوحة التحكم" });
  }
  if (user) {
    items.push({ label: "حسابي", link: "/profile", ariaLabel: "ملفي الشخصي" });
    items.push({
      label: cartCount > 0 ? `السلة (${cartCount})` : "السلة",
      link: "/cart",
      ariaLabel: "سلة المشتريات",
    });
  } else {
    items.push({ label: "تسجيل الدخول", link: "/login", ariaLabel: "تسجيل الدخول" });
  }

  const footer = (
    <>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted">المظهر</span>
        <ThemeToggleIcon />
      </div>
      {user && (
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/30 px-4 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-500/10 dark:text-red-400"
          >
            <LogOut className="h-4 w-4" />
            تسجيل الخروج
          </button>
        </form>
      )}
    </>
  );

  const logoNode = (
    <Link href="/" className="flex items-center gap-1.5 font-mono text-lg font-bold tracking-tight text-foreground">
      Orvion
      <span className="h-1.5 w-1.5 rounded-full bg-accent-strong" />
    </Link>
  );

  return (
    <StaggeredMenu
      className={className}
      position="right"
      items={items}
      colors={["#8b88ff", "#5227ff"]}
      accentColor="#8b88ff"
      displayItemNumbering={false}
      displaySocials={false}
      logoNode={logoNode}
      footer={footer}
    />
  );
}
