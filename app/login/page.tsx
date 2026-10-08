import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { LoginForm } from "./login-form";

export const metadata = { title: "تسجيل الدخول | Orvion" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  // مسار داخلي آمن فقط (يبدأ بشرطة واحدة)، وإلا فالرئيسية
  const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : "/";

  // إن كان مسجلاً بالفعل، وجّهه إلى الوجهة المطلوبة
  const session = await getSession();
  if (session) redirect(safeNext);

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-md rounded-2xl border border-black/10 bg-white/50 p-8 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold">تسجيل الدخول</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            مرحباً بعودتك إلى أورفيون
          </p>
        </div>
        <LoginForm next={safeNext} />
      </div>
    </main>
  );
}
