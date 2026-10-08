"use client";

// القائمة المنسدلة + أيقونة البروفايل (أو زر تسجيل الدخول إن لم يكن مسجلاً).
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Menu,
  User,
  Home,
  Briefcase,
  Wrench,
  ShoppingBag,
  Info,
  LayoutDashboard,
  LogOut,
  LogIn,
} from "lucide-react";
import { logoutAction } from "@/server/actions/auth";

type UserMenuProps = {
  user: { name: string } | null;
  isStaff: boolean;
};

const LINKS = [
  { href: "/", label: "الصفحة الرئيسية", icon: Home },
  { href: "/#works", label: "الأعمال", icon: Briefcase },
  { href: "/services", label: "الخدمات", icon: Wrench },
  { href: "/store", label: "المتجر الإلكتروني", icon: ShoppingBag },
  { href: "/about", label: "حول", icon: Info },
];

export function UserMenu({ user, isStaff }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="flex items-center gap-2">
      {/* القائمة المنسدلة — تظهر فقط عند تسجيل الدخول */}
      {user && (
      <div className="relative" ref={ref}>
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label="القائمة"
          aria-expanded={open}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 text-zinc-700 transition-colors hover:bg-black/5 dark:border-white/15 dark:text-zinc-200 dark:hover:bg-white/10"
        >
          <Menu className="h-[18px] w-[18px]" />
        </button>

        {open && (
          <div className="absolute right-0 top-12 z-50 w-56 overflow-hidden rounded-xl border border-black/10 bg-background shadow-lg dark:border-white/10">
            <nav className="flex flex-col py-1">
              {LINKS.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-black/5 dark:hover:bg-white/10"
                >
                  <Icon className="h-4 w-4 text-zinc-500" />
                  {label}
                </Link>
              ))}

              <div className="my-1 border-t border-black/10 dark:border-white/10" />

              {isStaff && (
                <Link
                  href="/dashboard"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-indigo-600 transition-colors hover:bg-black/5 dark:text-indigo-400 dark:hover:bg-white/10"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  لوحة التحكم
                </Link>
              )}

              <div className="my-1 border-t border-black/10 dark:border-white/10" />

              {user ? (
                <form action={logoutAction}>
                  <button
                    type="submit"
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                  >
                    <LogOut className="h-4 w-4" />
                    تسجيل الخروج
                  </button>
                </form>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-black/5 dark:hover:bg-white/10"
                >
                  <LogIn className="h-4 w-4 text-zinc-500" />
                  تسجيل الدخول
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
      )}

      {/* أيقونة البروفايل أو زر تسجيل الدخول */}
      {user ? (
        <Link
          href="/profile"
          aria-label="ملفي الشخصي"
          title={user.name}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 text-white transition-colors hover:bg-indigo-700"
        >
          <User className="h-[18px] w-[18px]" />
        </Link>
      ) : (
        <Link
          href="/login"
          className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
        >
          تسجيل الدخول
        </Link>
      )}
    </div>
  );
}
