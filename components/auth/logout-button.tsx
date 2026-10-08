// زر تسجيل الخروج — يستدعي إجراء الخادم logoutAction عبر <form>.
import { logoutAction } from "@/server/actions/auth";

export function LogoutButton({ className }: { className?: string }) {
  return (
    <form action={logoutAction}>
      <button
        type="submit"
        className={
          className ??
          "rounded-lg border border-black/10 px-4 py-2 text-sm font-medium transition-colors hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
        }
      >
        تسجيل الخروج
      </button>
    </form>
  );
}
