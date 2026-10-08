"use client";

// شريط جانبي لتنقّل لوحة المدير — الروابط تظهر حسب الصلاحيات.
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck, Users, Wallet, ArrowRight } from "lucide-react";

export function ManagerSidebar({
  isManager,
  canMembers,
  canDues,
}: {
  isManager: boolean;
  canMembers: boolean;
  canDues: boolean;
}) {
  const pathname = usePathname();
  const links = [
    { href: "/dashboard/manager/admins", label: "الأدمن", icon: ShieldCheck, show: isManager },
    { href: "/dashboard/manager/members", label: "المشتركون", icon: Users, show: canMembers },
    { href: "/dashboard/manager/dues", label: "مستحقات الدفع", icon: Wallet, show: canDues },
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
