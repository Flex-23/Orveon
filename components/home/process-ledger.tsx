"use client";

// الجزء التفاعلي من قسم "كيف نعمل": مسار تقدّم مرتبط بالتمرير،
// ظهور تتابعي للمراحل، وتحريك للأرقام المفرّغة. يحترم تقليل الحركة.
import { motion, useScroll, useSpring } from "framer-motion";
import { useRef } from "react";
import { ArrowLeft } from "lucide-react";
import { useReducedMotionSafe } from "./use-reduced-motion-safe";

const ease = [0.22, 1, 0.36, 1] as const;

export type ProcessStep = {
  n: string;
  title: string;
  desc: string;
};

export function ProcessLedger({ steps }: { steps: ProcessStep[] }) {
  const reduce = useReducedMotionSafe();
  const listRef = useRef<HTMLOListElement>(null);

  // تقدّم رأسي يتتبّع تمرير القائمة داخل الشاشة
  const { scrollYProgress } = useScroll({
    target: listRef,
    offset: ["start 75%", "end 60%"],
  });
  const fill = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 28,
    restDelta: 0.001,
  });

  return (
    <div className="relative">
      {/* مسار التقدّم — على جهة اليمين (بداية RTL)، يظهر على الشاشات المتوسطة فأكبر */}
      <div
        aria-hidden
        className="absolute right-0 top-0 hidden h-full w-px bg-border sm:block"
      >
        <motion.div
          style={{ scaleY: reduce ? 1 : fill, transformOrigin: "top" }}
          className="h-full w-full bg-linear-to-b from-accent to-accent-strong"
        />
      </div>

      <ol ref={listRef} className="border-t border-border sm:pr-10">
        {steps.map((step, i) => (
          <motion.li
            key={step.n}
            initial={reduce ? false : { opacity: 0, y: 30, filter: "blur(6px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, margin: "-90px" }}
            transition={{ duration: 0.6, delay: i * 0.04, ease }}
            className="relative border-b border-border"
          >
            {/* عقدة على المسار تتزامن مع ظهور المرحلة */}
            <motion.span
              aria-hidden
              initial={reduce ? false : { scale: 0, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true, margin: "-90px" }}
              transition={{ duration: 0.45, delay: 0.12 + i * 0.04, ease }}
              className="absolute right-0 top-10 hidden h-3 w-3 -translate-y-1/2 translate-x-1/2 rounded-full border-2 border-background bg-accent-strong shadow-glow sm:block"
            />

            <div className="group flex items-start gap-5 py-7 sm:gap-10">
              <motion.span
                initial={reduce ? false : { opacity: 0, y: 16, scale: 0.85 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-90px" }}
                transition={{ duration: 0.6, delay: 0.08 + i * 0.04, ease }}
                className="outline-text tabular shrink-0 text-4xl font-black leading-none sm:text-5xl"
              >
                {step.n}
              </motion.span>
              <div className="flex-1 pt-1">
                <h3 className="text-xl font-bold tracking-tight transition-colors group-hover:text-accent-strong sm:text-2xl">
                  {step.title}
                </h3>
                <p className="mt-2 max-w-xl text-pretty leading-relaxed text-muted">
                  {step.desc}
                </p>
              </div>
              <ArrowLeft className="mt-2 hidden h-5 w-5 shrink-0 -translate-x-2 text-accent opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 sm:block" />
            </div>
          </motion.li>
        ))}
      </ol>
    </div>
  );
}
