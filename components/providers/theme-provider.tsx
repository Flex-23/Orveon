"use client";

// مزوّد إدارة الوضع الليلي/النهاري (يعتمد على next-themes).
// MotionConfig reducedMotion="user" يحترم تفضيل تقليل الحركة على مستوى الحركة
// نفسها (لا على مستوى الـ markup)، فلا يسبّب عدم تطابق الترطيب.
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { MotionConfig } from "framer-motion";
import type { ComponentProps } from "react";

export function ThemeProvider({
  children,
  ...props
}: ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider {...props}>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </NextThemesProvider>
  );
}
