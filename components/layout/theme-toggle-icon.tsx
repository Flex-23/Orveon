"use client";

// زر أيقوني لتبديل الوضع الليلي/النهاري (للناف بار).
// نعرض الأيقونتين دائماً ونتحكّم بالظهور عبر variant الـ dark في CSS — هذا يتجنّب
// الحاجة لحالة "mounted" أو useEffect، ويمنع وميض الترطيب (hydration) دون أي تغيير بصري.
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

export function ThemeToggleIcon() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      aria-label="تبديل الوضع الليلي/النهاري"
      className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 text-zinc-700 transition-colors hover:bg-black/5 dark:border-white/15 dark:text-zinc-200 dark:hover:bg-white/10"
    >
      <Sun className="hidden h-[18px] w-[18px] dark:block" />
      <Moon className="h-[18px] w-[18px] dark:hidden" />
    </button>
  );
}
