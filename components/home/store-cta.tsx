"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Boxes,
  Check,
  LayoutTemplate,
  ShoppingBag,
  Sparkles,
  Store,
  type LucideIcon,
} from "lucide-react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import type { MouseEvent } from "react";
import { Reveal } from "./reveal";
import { useReducedMotionSafe } from "./use-reduced-motion-safe";

// زر مغناطيسي ينجذب نحو المؤشر — مملوء باللون المميّز مع لمعة تمرّ عند المرور.
function MagneticStoreButton() {
  const reduce = useReducedMotionSafe();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 15, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 200, damping: 15, mass: 0.4 });

  function onMove(e: MouseEvent<HTMLDivElement>) {
    if (reduce) return;
    const r = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - r.left - r.width / 2) * 0.3);
    y.set((e.clientY - r.top - r.height / 2) * 0.3);
  }

  function onLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      style={{ x: reduce ? 0 : sx, y: reduce ? 0 : sy }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="w-full sm:w-auto"
    >
      <Link
        href="/store"
        className="group relative inline-flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-accent-strong px-7 py-4 text-base font-bold text-(--accent-contrast) shadow-glow ring-1 ring-(--accent-strong)/30 transition-all hover:scale-[1.03] active:scale-[0.98] sm:w-auto"
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 -skew-x-12 bg-white/25 blur-md transition-transform duration-700 ease-out group-hover:translate-x-[420%]"
        />
        <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-(--accent-contrast)/15 transition-transform group-hover:rotate-[-8deg]">
          <ShoppingBag className="h-4 w-4" />
        </span>
        <span className="relative">الذهاب إلى المتجر</span>
        <ArrowLeft className="relative h-4 w-4 transition-transform group-hover:-translate-x-1" />
      </Link>
    </motion.div>
  );
}

// بطاقة منتج زجاجية عائمة — تطفو بلطف وتميل قليلاً، وترتفع عند المرور.
function FloatingCard({
  icon: Icon,
  title,
  meta,
  rotate,
  offset,
  delay,
}: {
  icon: LucideIcon;
  title: string;
  meta: string;
  rotate: string;
  offset: string;
  delay: number;
}) {
  const reduce = useReducedMotionSafe();
  return (
    <motion.div
      initial={false}
      animate={reduce ? undefined : { y: [0, -10, 0] }}
      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay }}
      style={{ rotate }}
      className={`glass group flex items-center gap-4 rounded-2xl p-4 transition-transform hover:!rotate-0 hover:scale-[1.04] ${offset}`}
    >
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent-strong/12 text-accent-strong">
        <Icon className="h-6 w-6" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-bold">{title}</p>
        <p className="mt-0.5 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <Check className="h-3.5 w-3.5 text-accent-strong" strokeWidth={3} />
          {meta}
        </p>
      </div>
      <ArrowLeft className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-x-1 group-hover:text-accent-strong" />
    </motion.div>
  );
}

const cards = [
  { icon: Store, title: "قالب متجر إلكتروني", meta: "جاهز للتسليم", rotate: "-2deg", offset: "lg:me-8", delay: 0 },
  { icon: LayoutTemplate, title: "موقع شركة احترافي", meta: "تصميم حديث", rotate: "1.5deg", offset: "lg:ms-6", delay: 0.6 },
  { icon: Boxes, title: "نظام إدارة متكامل", meta: "قابل للتخصيص", rotate: "-1deg", offset: "lg:me-4", delay: 1.2 },
];

export function StoreCta() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-28">
      <Reveal blur>
        <div className="mesh-bg edge-glow relative overflow-hidden rounded-[2.5rem] border border-border px-8 py-16 sm:px-14">
          {/* كرات توهّج زخرفية */}
          <div className="glow mesh-orb pointer-events-none absolute -right-16 -top-24 h-72 w-72 opacity-40" />
          <div className="glow pointer-events-none absolute -bottom-28 left-1/4 h-64 w-64 opacity-25" />

          <div className="relative z-10 grid items-center gap-14 lg:grid-cols-[1fr_0.9fr]">
            {/* النص + الزر */}
            <div>
              <span className="kicker spec text-accent-strong">
                <Sparkles className="h-3.5 w-3.5" />
                THE STORE
              </span>
              <h2 className="mt-5 text-4xl font-extrabold tracking-tight sm:text-5xl lg:leading-[1.1]">
                حلول برمجية جاهزة،
                <span className="text-accent-strong"> بنقرة واحدة.</span>
              </h2>

              <div className="mt-9 flex flex-col items-stretch gap-4 sm:flex-row sm:items-center">
                <MagneticStoreButton />
                <p className="inline-flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Check className="h-4 w-4 text-accent-strong" strokeWidth={3} />
                  أدوات جاهزة للتشغيل
                </p>
              </div>
            </div>

            {/* بطاقات المنتجات العائمة */}
            <div className="flex flex-col gap-5">
              {cards.map((c) => (
                <FloatingCard key={c.title} {...c} />
              ))}
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}