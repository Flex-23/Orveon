"use client";

import {
  motion,
  useInView,
  useMotionValue,
  useMotionValueEvent,
  animate,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Boxes, CalendarClock, Headset, HeartHandshake } from "lucide-react";
import { useReducedMotionSafe } from "./use-reduced-motion-safe";

const stats = [
  { index: "01", value: 30, suffix: "+", label: "مشروع منجز", Icon: Boxes },
  { index: "02", value: 40, suffix: "+", label: "عميل راضٍ", Icon: HeartHandshake },
  { index: "03", value: 5, suffix: "+", label: "سنوات خبرة", Icon: CalendarClock },
  {
    index: "04",
    value: 24,
    suffix: "/7",
    label: "دعم متواصل",
    Icon: Headset,
    isSpecial: true,
  },
] as const;

function AnimatedStat({
  value,
  suffix,
  isSpecial,
}: {
  value: number;
  suffix: string;
  isSpecial?: boolean;
}) {
  const reduce = useReducedMotionSafe();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const count = useMotionValue(0);
  const [display, setDisplay] = useState(0);

  useMotionValueEvent(count, "change", (v) => setDisplay(Math.round(v)));

  useEffect(() => {
    // مع تقليل الحركة لا نشغّل العدّ التصاعدي (تُعرض القيمة النهائية مباشرةً أدناه)
    if (!inView || isSpecial || reduce) return;
    const controls = animate(count, value, {
      duration: 1.4,
      ease: [0.22, 1, 0.36, 1],
    });
    return controls.stop;
  }, [inView, value, count, isSpecial, reduce]);

  const cls =
    "tabular block text-[2.75rem] font-bold leading-none tracking-tight sm:text-5xl lg:text-[3.25rem]";

  if (isSpecial) {
    return (
      <span ref={ref} className={cls}>
        24/7
      </span>
    );
  }

  return (
    <span ref={ref} className={cls}>
      <motion.span>{reduce ? value : display}</motion.span>
      {suffix}
    </span>
  );
}

export function StatsBand() {
  return (
    <section className="relative overflow-hidden border-y border-border bg-surface/40">
      <div className="pointer-events-none absolute inset-0 bg-linear-to-l from-accent/[0.05] via-transparent to-accent/[0.05]" />
      <div className="relative mx-auto max-w-7xl px-6 py-14 sm:py-16">
        <div className="mb-10 flex items-center justify-between gap-4">
          <span className="kicker text-sm font-semibold text-muted">
            أورفيون بالأرقام
          </span>
          <span className="spec hidden text-muted/60 sm:block [direction:ltr]">
            TRACK RECORD
          </span>
        </div>

        <div className="grid grid-cols-2 gap-x-8 gap-y-10 lg:grid-cols-4">
          {stats.map((stat, i) => {
            const { index, value, suffix, label, Icon } = stat;
            const isSpecial = "isSpecial" in stat && stat.isSpecial;
            return (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{
                  duration: 0.55,
                  delay: i * 0.07,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="group relative border-t border-border pt-5 transition-colors duration-300 hover:border-accent/45"
              >
                <div className="mb-7 flex items-center justify-between">
                  <span className="spec tabular text-muted/60 [direction:ltr]">
                    {index}
                  </span>
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-background text-accent-strong transition-all duration-300 group-hover:-translate-y-0.5 group-hover:border-accent/40 group-hover:bg-accent/10">
                    <Icon className="h-4 w-4" strokeWidth={1.75} />
                  </span>
                </div>
                <AnimatedStat value={value} suffix={suffix} isSpecial={isSpecial} />
                <p className="mt-2.5 text-sm text-muted">{label}</p>
                {/* خطّ مميّز ينمو عند الظهور — لمسة دفترية (يبدأ من اليمين في RTL) */}
                <motion.span
                  aria-hidden
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{
                    duration: 0.7,
                    delay: 0.2 + i * 0.07,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="mt-4 block h-px origin-right bg-linear-to-l from-accent/50 to-transparent transition-colors duration-300 group-hover:from-accent"
                />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
