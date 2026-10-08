"use client";

// شريط جانبي لتنقّل لوحة المحتوى.
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Briefcase, Wrench, Sparkles, ArrowRight } from "lucide-react";

export function ContentSidebar() {
  const pathname = usePathname();
  const links = [
    { href: "/dashboard/content/works", label: "الأعمال", icon: Briefcase },
    { href: "/dashboard/content/services", label: "الخدمات", icon: Wrench },
    { href: "/dashboard/content/trials", label: "طلبات النسخ التجريبية", icon: Sparkles },
  ];

  return (
    <nav className="flex flex-col gap-1">
      <Link
        href="/dashboard"
        className="mb-2 flex items-center gap-2 px-3 py-2 text-sm text-muted transition-colors hover:text-accent-strong"
      >
        <ArrowRight className="h-4 w-4" />
        كل اللوحات
      </Link>
      {links.map(({ href, label, icon: Icon }) => {
        const active = pathname.startsWith(href);
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
