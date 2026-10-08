"use client";

// جرس الإشعارات للطاقم (المدير/الأدمن) — يعرض عدّاداً وقائمة منسدلة بالعناصر
// التي تحتاج انتباهاً (طلبات، حجوزات، وأنواع تُضاف مستقبلاً).
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, ShoppingBag, CalendarClock, Rocket, Inbox, ArrowLeft } from "lucide-react";

type BellNotification = {
  id: string;
  kind: "order" | "reservation" | "project";
  title: string;
  subtitle: string;
  href: string;
  time: string;
};

const KIND_ICON = {
  order: ShoppingBag,
  reservation: CalendarClock,
  project: Rocket,
} as const;

export function NotificationsBell({
  items,
  count,
}: {
  items: BellNotification[];
  count: number;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const badge = count > 9 ? "9+" : String(count);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="الإشعارات"
        aria-expanded={open}
        className="relative flex h-9 w-9 items-center justify-center rounded-full border border-black/10 text-zinc-700 transition-colors hover:bg-black/5 dark:border-white/15 dark:text-zinc-200 dark:hover:bg-white/10"
      >
        <Bell className="h-[18px] w-[18px]" />
        {count > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-bold text-white">
            {badge}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-80 overflow-hidden rounded-xl border border-black/10 bg-background shadow-lg dark:border-white/10">
          <div className="flex items-center justify-between border-b border-black/10 px-4 py-3 dark:border-white/10">
            <span className="text-sm font-semibold">الإشعارات</span>
            {count > 0 && (
              <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-xs font-bold text-red-600 dark:text-red-400">
                {count} جديد
              </span>
            )}
          </div>

          {items.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
              <Inbox className="h-8 w-8 text-zinc-400" />
              <p className="text-sm text-muted">لا توجد إشعارات جديدة.</p>
            </div>
          ) : (
            <ul className="max-h-96 overflow-y-auto py-1">
              {items.map((n) => {
                const Icon = KIND_ICON[n.kind];
                return (
                  <li key={n.id}>
                    <Link
                      href={n.href}
                      onClick={() => setOpen(false)}
                      className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-black/5 dark:hover:bg-white/10"
                    >
                      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">{n.title}</span>
                        <span className="block truncate text-xs text-muted">{n.subtitle}</span>
                        <span className="mt-0.5 block text-[11px] text-zinc-400" dir="ltr">
                          {n.time}
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="border-t border-black/10 dark:border-white/10">
            <Link
              href="/dashboard/store/orders"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-medium text-indigo-600 transition-colors hover:bg-black/5 dark:text-indigo-400 dark:hover:bg-white/10"
            >
              إدارة الطلبات والحجوزات
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
