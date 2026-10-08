import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { RegisterForm } from "./register-form";

export const metadata = { title: "إنشاء حساب | Orvion" };

export default async function RegisterPage() {
  const session = await getSession();
  if (session) redirect("/");

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-md rounded-2xl border border-black/10 bg-white/50 p-8 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold">إنشاء حساب جديد</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            انضم إلى أورفيون كزبون
          </p>
        </div>
        <RegisterForm />
      </div>
    </main>
  );
}
