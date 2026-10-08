"use client";

// يخفي الفوتر داخل لوحات التحكم (/dashboard) ويُظهره في باقي الموقع.
// الفوتر يبقى مكوّن خادم ويُمرَّر هنا كـ children.
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export function FooterGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/dashboard")) return null;
  return <>{children}</>;
}
