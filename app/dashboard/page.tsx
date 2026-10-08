import Link from "next/link";
import { Store, LayoutTemplate, Sparkles, Rocket, ShieldCheck, Users, Wallet, ArrowLeft } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/session";
import { canAccessDues, hasPermission, isManager } from "@/lib/auth/permissions";

export const metadata = { title: "لوحة التحكم | Orvion" };

export default async function DashboardHub() {
  const user = (await getCurrentUser())!; // مضمون بواسطة layout
  const manager = isManager(user.role);
  const canMembers = hasPermission(user, "canManageMembers");
  const canContent = hasPermission(user, "canManageContent");
  const canProjects = hasPermission(user, "canManageProjects");
  const canDues = canAccessDues(user);

  const cards = [
    {
      href: "/dashboard/store",
      title: "لوحة المتجر",
      desc: "المنتجات، الأقسام، الحجوزات، الطلبات، والإحصائيات.",
      icon: Store,
      available: true,
    },
    {
      href: "/dashboard/content",
      title: "لوحة المحتوى",
      desc: "إدارة الأعمال والخدمات في الصفحة الرئيسية.",
      icon: LayoutTemplate,
      available: true,
    },
    {
      href: "/dashboard/content/trials",
      title: "طلبات النسخ التجريبية",
      desc: "طلبات العملاء لتجربة الأعمال المعروضة وحالتها.",
      icon: Sparkles,
      available: canContent,
    },
    {
      href: "/dashboard/projects",
      title: "طلبات المشاريع",
      desc: "طلبات «ابدأ مشروعك» من الزبائن — التفاصيل وتحديد الحالة.",
      icon: Rocket,
      available: canProjects,
    },
    {
      href: "/dashboard/manager",
      title: "لوحة المدير",
      desc: "إدارة الأدمن والمشتركين والصلاحيات.",
      icon: ShieldCheck,
      available: manager,
    },
    {
      // وصول الأدمن للمشتركين عبر صلاحية canManageMembers (بدون كونه مديراً)
      href: "/dashboard/manager/members",
      title: "المشتركون",
      desc: "إضافة المشتركين وإدارتهم وإرسال بيانات الدخول.",
      icon: Users,
      available: !manager && canMembers,
    },
    {
      href: "/dashboard/manager/dues",
      title: "مستحقات الدفع",
      desc: "المشتركون الذين عليهم مبالغ متبقّية لم تُدفع بالكامل.",
      icon: Wallet,
      available: canDues,
    },
  ];

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-12">
      <h1 className="mb-2 text-2xl font-bold tracking-tight sm:text-3xl">لوحة التحكم</h1>
      <p className="mb-10 text-muted">
        أهلاً {user.name}. اختر اللوحة التي تريد إدارتها.
      </p>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {cards
          .filter((c) => c.available)
          .map(({ href, title, desc, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="group rounded-2xl border border-line bg-panel p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-accent/40 hover:shadow-lg hover:shadow-accent/5"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-accent/20 bg-accent/10 text-accent-strong transition-colors group-hover:bg-accent-strong group-hover:text-(--accent-contrast)">
                <Icon className="h-6 w-6" />
              </div>
              <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
              <p className="mt-1 text-sm text-muted">{desc}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-accent-strong transition-transform group-hover:-translate-x-1">
                دخول
                <ArrowLeft className="h-4 w-4" />
              </span>
            </Link>
          ))}
      </div>
    </main>
  );
}
