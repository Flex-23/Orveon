"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { type ReactNode } from "react";
import { ArrowLeft, Sparkles } from "lucide-react";
import { useReducedMotionSafe } from "./use-reduced-motion-safe";
import { RotatingGlobe } from "./rotating-globe";

const ease = [0.22, 1, 0.36, 1] as const;

// تظهر كلمات العنوان تباعاً (stagger)
const wordVariants: Variants = {
  hidden: { y: 22, opacity: 0, filter: "blur(8px)" },
  show: {
    y: 0,
    opacity: 1,
    filter: "blur(0px)",
    transition: { duration: 0.72, ease },
  },
};

// كلمة من العنوان تظهر ضمن الحركة المتتابعة — مكوّن ثابت معرّف خارج الرسم.
function Word({ children }: { children: ReactNode }) {
  return (
    <motion.span variants={wordVariants} className="inline-block">
      {children}
    </motion.span>
  );
}

// حلقة مدارية دوّارة حول الكرة مع نقطة ضوئية تدور على محيطها — لمسة تقنية.
function Orbit({
  className,
  duration,
  reverse,
  dotClassName,
}: {
  className: string;
  duration: number;
  reverse?: boolean;
  dotClassName: string;
}) {
  const reduce = useReducedMotionSafe();
  return (
    <motion.div
      aria-hidden
      animate={reduce ? undefined : { rotate: reverse ? -360 : 360 }}
      transition={
        reduce
          ? undefined
          : { duration, repeat: Infinity, ease: "linear" }
      }
      className={`pointer-events-none absolute rounded-full ${className}`}
    >
      <span
        className={`absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full ${dotClassName}`}
      />
    </motion.div>
  );
}

export function HeroSection() {
  const reduce = useReducedMotionSafe();

  const headlineContainer: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
  };

  const rise = (delay: number) => ({
    initial: reduce ? false : { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.75, delay, ease },
  });

  return (
    <section className="mesh-bg noise relative flex min-h-dvh flex-col overflow-hidden">
      {/* الخلفيات الزخرفية */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="bg-grid absolute inset-0 opacity-[0.3] [mask-image:radial-gradient(ellipse_85%_60%_at_50%_0%,black,transparent)]" />
        <div className="glow absolute -top-40 left-[-12%] h-[40rem] w-[40rem] opacity-25" />
        <div className="glow absolute -bottom-24 right-[-8%] h-[30rem] w-[30rem] opacity-[0.1]" />
      </div>

      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center px-6 pb-12 pt-28 lg:pt-32">
        {/* شريط علوي: الحالة + علامة الستوديو */}
        <motion.div
          {...rise(0)}
          className="flex items-center justify-between gap-4 border-b border-border/70 pb-6"
        >
          <span className="inline-flex items-center gap-2.5 text-sm font-medium text-muted">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-strong/60" />
              <motion.span
                animate={reduce ? undefined : { scale: [1, 1.3, 1] }}
                transition={
                  reduce
                    ? undefined
                    : { duration: 2.4, repeat: Infinity, ease: "easeInOut" }
                }
                className="relative inline-flex h-2 w-2 rounded-full bg-accent-strong"
              />
            </span>
            ستوديو تطوير
          </span>
          <span className="spec hidden text-muted/80 sm:block [direction:ltr]">
            ORVION · STUDIO
          </span>
        </motion.div>

        {/* الشبكة الرئيسية: النص (يمين) + الكرة (يسار) على الشاشات الكبيرة */}
        <div className="mt-10 grid items-center gap-12 lg:mt-14 lg:grid-cols-2 lg:gap-10">
          {/* عمود النص */}
          <div className="order-2 lg:order-1">
            {/* وسم تمهيدي */}
            <motion.span
              {...rise(0.15)}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-2/50 px-3.5 py-1.5 text-xs font-medium text-muted backdrop-blur"
            >
              <Sparkles className="h-3.5 w-3.5 text-accent-strong" />
              حلول برمجية متكاملة
            </motion.span>

            {/* العنوان — يظهر كلماته تباعاً */}
            <motion.h1
              variants={headlineContainer}
              initial={reduce ? false : "hidden"}
              animate="show"
              className="mt-6 max-w-[15ch] text-balance text-[clamp(2.25rem,5.2vw,4rem)] font-black leading-[1.08] tracking-tight"
            >
              <Word>نحوّل</Word>{" "}
              <Word>فكرتك</Word>{" "}
              <Word>إلى</Word>{" "}
              <motion.span
                variants={wordVariants}
                className="bg-linear-to-l from-accent-strong to-accent-strong/60 bg-clip-text text-transparent"
              >
                إبداع
              </motion.span>
            </motion.h1>

            {/* وصف داعم */}
            <motion.p
              {...rise(0.35)}
              className="mt-5 max-w-md text-pretty text-base leading-relaxed text-muted sm:text-lg"
            >
              تصميم وتطوير برامج و تطبيقات وانظمة باداء عالي وتجربة سلسة  
              استخدام تترك أثراً — من الفكرة الأولى حتى الإطلاق.
            </motion.p>

            {/* أزرار الإجراء */}
            <motion.div
              {...rise(0.5)}
              className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center"
            >
              <Link
                href="/start-project"
                className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full bg-accent-strong px-7 py-3.5 font-semibold text-(--accent-contrast) shadow-glow transition-transform hover:scale-[1.03] active:scale-[0.98]"
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 -skew-x-12 bg-white/30 blur-md transition-transform duration-700 ease-out group-hover:translate-x-[420%]"
                />
                <span className="relative">ابدأ مشروعك</span>
                <ArrowLeft className="relative h-4 w-4 transition-transform group-hover:-translate-x-1" />
              </Link>

              <Link
                href="#works"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-surface-2/40 px-7 py-3.5 font-semibold text-foreground backdrop-blur transition-colors hover:border-accent/50 hover:bg-surface-2/70"
              >
                شاهد أعمالنا
              </Link>
            </motion.div>
          </div>

          {/* عمود الكرة الأرضية الدوّارة مع حلقة مدارية */}
          <motion.div
            initial={reduce ? false : { opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.2, ease }}
            className="relative order-1 mx-auto w-full max-w-72 sm:max-w-sm lg:order-2 lg:max-w-lg"
          >
            {/* حلقة مدارية واحدة قريبة من الكرة — بلون مميّز يبرز في الوضعين */}
            <Orbit
              className="-inset-5 border border-accent-strong/35 sm:-inset-7"
              duration={26}
              dotClassName="h-2 w-2 bg-accent-strong shadow-glow"
            />

            {/* الكرة الأرضية — ثابتة في مكانها */}
            <div className="relative">
              <RotatingGlobe className="pointer-events-none relative block aspect-square w-full" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
