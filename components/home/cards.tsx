"use client";

import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, PlayCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type SpringConfig = {
  type: "spring";
  bounce?: number;
  visualDuration?: number;
  stiffness?: number;
  damping?: number;
  mass?: number;
};

// شكل الخدمة القادم من قاعدة البيانات (الحقول اللي يحتاجها الكارد فقط)
export type ServiceForCard = {
  id: number;
  title: string;
  description: string | null;
  images: { imageUrl: string }[];
};

export interface CardsProps {
  services: ServiceForCard[];
  spring?: SpringConfig;
  activeScale?: number;
  cardSpacing?: number;
}

const defaultSpring: SpringConfig = {
  type: "spring",
  visualDuration: 0.6,
  bounce: 0.25,
};

// ألوان غامقة لكنها مختلفة بنبرة لكل كارد (تتكرّر بالتدوير حسب العدد)
const SKINS = [
  "from-zinc-900 to-zinc-800",
  "from-blue-950 to-slate-900",
  "from-purple-950 to-zinc-900",
  "from-emerald-950 to-neutral-900",
  "from-rose-950 to-zinc-900",
  "from-amber-950 to-stone-900",
];

// تبعثر طبيعي لكل كارد (ارتفاع ودوران) — يدور بالتدوير حسب العدد
const CONFIG = [
  { y: -20, rotate: -15 },
  { y: 20, rotate: 8 },
  { y: -80, rotate: -5 },
  { y: 20, rotate: 12 },
  { y: 20, rotate: -5 },
  { y: -40, rotate: 6 },
];

// عرض بديل للجوال: كروت بسيطة مكدّسة بدل الديك المبعثر.
export function ServicesMobileCards({
  services,
  className,
}: {
  services: ServiceForCard[];
  className?: string;
}) {
  if (services.length === 0) {
    return (
      <p className={cn("text-center text-muted", className)}>
        لا توجد خدمات لعرضها بعد.
      </p>
    );
  }

  return (
    <div className={cn("grid grid-cols-1 gap-5 sm:grid-cols-2", className)}>
      {services.map((service) => {
        const cover = service.images[0]?.imageUrl ?? null;
        return (
          <Link
            key={service.id}
            href={`/services/${service.id}`}
            className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface/60 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-glow"
          >
            <div className="relative aspect-16/10 overflow-hidden bg-linear-to-br from-accent/15 via-transparent to-accent/5">
              {cover ? (
                <Image
                  src={cover}
                  alt={service.title}
                  fill
                  sizes="(min-width: 640px) 320px, 100vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="grid h-full place-items-center">
                  <PlayCircle className="h-10 w-10 text-accent/40" />
                </div>
              )}
              <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent" />
            </div>

            <div className="flex flex-1 flex-col p-4">
              <h3 className="text-lg font-bold tracking-tight transition-colors group-hover:text-accent-strong">
                {service.title}
              </h3>
              {service.description && (
                <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">
                  {service.description}
                </p>
              )}
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-accent-strong">
                التفاصيل الكاملة
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

export const Cards = ({
  services,
  spring = defaultSpring,
  activeScale = 1.1,
  cardSpacing = 180,
}: CardsProps) => {
  const [active, setActive] = useState<ServiceForCard | null>(null);
  const [spacing, setSpacing] = useState(cardSpacing);
  const ref = useRef<HTMLDivElement>(null);
  const cardSpring = spring;

  // النقر خارج الديك يسكّر الكارد المفتوح
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setActive(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // مسافة الكروت حسب حجم الشاشة
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () =>
      setSpacing(mq.matches ? cardSpacing : Math.round(cardSpacing * 0.42));
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [cardSpacing]);

  if (services.length === 0) {
    return (
      <p className="text-center text-muted">لا توجد خدمات لعرضها بعد.</p>
    );
  }

  const middle = (services.length - 1) / 2;
  const isAnyActive = active !== null;
  const isActive = (s: ServiceForCard) => active?.id === s.id;

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
      <motion.div
        ref={ref}
        onClick={() => setActive(null)}
        dir="rtl"
        className="relative mx-auto flex h-[33rem] w-full max-w-6xl items-center justify-center [--height:340px] [--width:250px] lg:h-[40rem] lg:[--height:450px] lg:[--width:330px]"
      >
        {services.map((service, index) => {
          // RTL: الأحدث يبدأ من اليمين
          const offsetX = (middle - index) * spacing;
          const conf = CONFIG[index % CONFIG.length];
          const skin = SKINS[index % SKINS.length];
          const cover = service.images[0]?.imageUrl ?? null;
          const activeNow = isActive(service);

          return (
            <motion.div key={service.id}>
              <motion.button
                type="button"
                aria-label={`عرض ${service.title}`}
                initial={{ x: 0, scale: 0 }}
                onClick={(e) => {
                  e.stopPropagation();
                  setActive(service);
                }}
                animate={{
                  y: activeNow ? 0 : isAnyActive ? 460 : conf.y,
                  x: activeNow ? 0 : isAnyActive ? offsetX * 0.4 : offsetX,
                  rotate: activeNow
                    ? 0
                    : isAnyActive
                      ? 0.2 * conf.rotate
                      : conf.rotate,
                  scale: activeNow ? activeScale : isAnyActive ? 0.7 : 1,
                }}
                whileHover={{
                  scale: activeNow ? activeScale : isAnyActive ? 0.7 : 1.05,
                }}
                transition={cardSpring}
                style={{
                  width: `var(--width)`,
                  height: `var(--height)`,
                  marginInlineStart: `calc(var(--width) / -2)`,
                  marginTop: `calc(var(--height) / -2)`,
                  zIndex: activeNow ? 50 : 10 + index,
                }}
                className={cn(
                  "absolute top-1/2 right-1/2 flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br p-3 text-right text-white shadow-2xl ring-1 ring-white/10 md:p-4",
                  skin,
                )}
              >
                {/* صورة الواجهة (تصغّر شوية لمّا الكارد يفتح حتى يصير مجال للوصف والزر) */}
                <motion.div
                  animate={{ height: activeNow ? "40%" : "52%" }}
                  transition={cardSpring}
                  className="relative w-full shrink-0 overflow-hidden rounded-xl border border-white/10 bg-white/5"
                >
                  {cover ? (
                    <Image
                      src={cover}
                      alt={service.title}
                      fill
                      sizes="(min-width: 1024px) 330px, 250px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="grid h-full place-items-center">
                      <PlayCircle className="h-10 w-10 text-white/40" />
                    </div>
                  )}
                </motion.div>

                <div className="mt-4 flex min-h-0 flex-1 flex-col">
                  <h2 className="text-lg font-semibold leading-tight md:text-2xl">
                    {service.title}
                  </h2>

                  <AnimatePresence mode="popLayout">
                    {activeNow && service.description && (
                      <motion.p
                        key="desc"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={cardSpring}
                        className="mt-2 line-clamp-3 text-sm leading-relaxed text-white/75"
                      >
                        {service.description}
                      </motion.p>
                    )}
                  </AnimatePresence>

                  <AnimatePresence mode="popLayout">
                    {activeNow && (
                      <motion.div
                        key="cta"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={cardSpring}
                        className="mt-3"
                      >
                        <Link
                          href={`/services/${service.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex w-fit items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-zinc-950 shadow-lg shadow-black/20 transition hover:bg-white/90"
                        >
                          التفاصيل الكاملة
                          <ArrowLeft className="h-4 w-4" />
                        </Link>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.button>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
};

export default Cards;
