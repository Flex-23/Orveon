// الناف بار: شعار | شريط بحث | (تبديل الوضع + سلة + قائمة منسدلة + بروفايل/دخول).
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/session";
import { isAdminOrManager } from "@/lib/auth/permissions";
import { getCartCount } from "@/server/queries/cart";
import { getStaffNotifications } from "@/server/queries/notifications";
import { SearchBar } from "./search-bar";
import { ThemeToggleIcon } from "./theme-toggle-icon";
import { NotificationsBell } from "./notifications-bell";
import { UserMenu } from "./user-menu";
import { MobileNav } from "./mobile-nav";

export async function Navbar() {
  const user = await getCurrentUser();
  const isStaff = user ? isAdminOrManager(user.role) : false;
  const cartCount = user ? await getCartCount(user.id) : 0;
  const notifications =
    user && isStaff
      ? await getStaffNotifications(user)
      : { items: [], count: 0 };

  return (
    <>
      {/* تنقّل الجوال — قائمة منزلقة (StaggeredMenu) */}
      <MobileNav
        className="md:hidden"
        user={user ? { name: user.name } : null}
        isStaff={isStaff}
        cartCount={cartCount}
      />

      {/* الناف بار الكامل — للشاشات المتوسطة فأكبر */}
      <header className="sticky top-0 z-50 hidden border-b border-black/10 bg-background/80 backdrop-blur-md md:block dark:border-white/10">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:gap-5">
        {/* 1) الإجراءات (تبديل الوضع + سلة + قائمة منسدلة + بروفايل/دخول) — في مكان الشعار سابقاً */}
        <div className="flex shrink-0 items-center gap-2">
          <ThemeToggleIcon />

          {/* جرس الإشعارات — للمدير والأدمن فقط */}
          {isStaff && (
            <NotificationsBell items={notifications.items} count={notifications.count} />
          )}

          {/* اختصار سلة المشتريات — يظهر عند تسجيل الدخول فقط */}
          {user && (
            <Link
              href="/cart"
              aria-label="سلة المشتريات"
              className="relative flex h-9 w-9 items-center justify-center rounded-full border border-black/10 text-zinc-700 transition-colors hover:bg-black/5 dark:border-white/15 dark:text-zinc-200 dark:hover:bg-white/10"
            >
              <ShoppingCart className="h-[18px] w-[18px]" />
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-indigo-600 px-1 text-[11px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </Link>
          )}

          <UserMenu user={user ? { name: user.name } : null} isStaff={isStaff} />
        </div>

        {/* 2) شريط البحث */}
        <div className="flex-1">
          <SearchBar />
        </div>

        {/* 3) الشعار — في الجهة الأخرى */}
        <Link
          href="/"
          className="flex shrink-0 items-center gap-1 font-mono text-lg font-bold tracking-tight"
        >
          Orvion
          <span className="h-1.5 w-1.5 rounded-full bg-accent-strong" />
        </Link>
      </div>
      </header>
    </>
  );
}
