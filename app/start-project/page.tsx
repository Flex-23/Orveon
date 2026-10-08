import { redirect } from "next/navigation";
import { Rocket } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/session";
import { ProjectRequestForm } from "@/components/projects/project-request-form";

// الصفحة تعتمد على جلسة المستخدم (تعبئة تلقائية) — لا تُولَّد مسبقاً أثناء البناء.
export const dynamic = "force-dynamic";

export const metadata = { title: "ابدأ مشروعك | Orvion" };

export default async function StartProjectPage() {
  const user = await getCurrentUser();
  // النموذج يُملأ من بيانات التسجيل — غير المسجّل يُوجَّه للدخول ثم يعود هنا.
  if (!user) redirect("/login?next=/start-project");

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-xl rounded-2xl border border-black/10 bg-white/50 p-8 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
        <div className="mb-6 text-center">
          <span className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-accent/20 bg-accent/10 text-accent-strong">
            <Rocket className="h-6 w-6" />
          </span>
          <h1 className="text-2xl font-bold">ابدأ مشروعك</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            أخبرنا عن فكرتك وسنتواصل معك — تابع حالة طلبك من الصفحة الرئيسية.
          </p>
        </div>
        <ProjectRequestForm
          defaultName={user.name}
          defaultPhone={user.phone}
          defaultGovernorate={user.governorate ?? ""}
        />
      </div>
    </main>
  );
}
