"use client";

// غلاف لإظهار العناصر بأنيميشن عند السكرول — مع خيار ضباب خفيف.
// لا نفرّع البناء (markup) بناءً على تفضيل "تقليل الحركة" هنا: المزوّد يضبط
// MotionConfig reducedMotion="user" الذي يحترم التفضيل تلقائياً (يُبقي تلاشي
// الشفافية ويُلغي الإزاحة/الحركة). هذا يتجنّب عدم تطابق الترطيب، ويمنع بقاء
// العنصر مخفياً (opacity:0) عند المستخدمين المفعّلين لتقليل الحركة.
import { motion } from "framer-motion";
import type { ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  delay?: number;
  y?: number;
  blur?: boolean;
  className?: string;
};

export function Reveal({
  children,
  delay = 0,
  y = 32,
  blur = false,
  className,
}: RevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y, filter: blur ? "blur(8px)" : "blur(0px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-70px" }}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
