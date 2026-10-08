"use client";

// شاشة خطأ بأسلوب «glitch» — تُستخدم لصفحة 404، وأخطاء التشغيل، وصفحة الصيانة لاحقاً.
// الرقم يتفكّك ثم يستقرّ (scramble)، وعند المرور بالمؤشر تنزاح طبقتا نيون أحمر/سماوي.
import { useEffect, useState, type ReactNode } from "react";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

const DEFAULTS = {
  code: "404",
  title: "الصفحة غير موجودة",
  description: "الصفحة التي تبحث عنها غير موجودة أو تم نقلها.",
  homeHref: "/",
  homeLabel: "العودة للرئيسية",
  browseHref: "/store",
  browseLabel: "تصفّح المتجر",
};

export interface NotFoundGlitchProps {
  className?: string;
  code?: string;
  title?: string;
  description?: string;
  homeHref?: string;
  homeLabel?: string;
  browseHref?: string;
  browseLabel?: string;
  /** عند تمريرها يظهر زر «إعادة المحاولة» كإجراء رئيسي (لصفحات الأخطاء). */
  onRetry?: () => void;
  retryLabel?: string;
}

function Stage({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <section
      className={cn(
        "flex min-h-[520px] w-full flex-col items-center justify-center gap-8 px-6 py-20 text-center",
        className,
      )}
    >
      {children}
    </section>
  );
}

function Actions({
  homeHref = DEFAULTS.homeHref,
  homeLabel = DEFAULTS.homeLabel,
  browseHref = DEFAULTS.browseHref,
  browseLabel = DEFAULTS.browseLabel,
  onRetry,
  retryLabel = "إعادة المحاولة",
}: Pick<
  NotFoundGlitchProps,
  "homeHref" | "homeLabel" | "browseHref" | "browseLabel" | "onRetry" | "retryLabel"
>) {
  const primary =
    "inline-flex h-10 items-center justify-center rounded-full bg-foreground px-5 text-sm font-medium text-background transition-transform active:scale-[0.97]";
  const secondary =
    "inline-flex h-10 items-center justify-center rounded-full border border-border bg-card px-5 text-sm font-medium text-foreground transition-transform hover:bg-muted active:scale-[0.97]";

  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      {onRetry ? (
        <button type="button" onClick={onRetry} className={primary}>
          {retryLabel}
        </button>
      ) : (
        <a href={homeHref} className={primary}>
          {homeLabel}
        </a>
      )}

      {onRetry ? (
        <a href={homeHref} className={secondary}>
          {homeLabel}
        </a>
      ) : (
        <a href={browseHref} className={secondary}>
          {browseLabel}
        </a>
      )}
    </div>
  );
}

const GLYPHS = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789#%&@$?/\\";
const SCRAMBLE_MS = 700;
const TICK_MS = 45;

function Scramble({ text }: { text: string }) {
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(text);

  useEffect(() => {
    if (reduce) return; // عند تقليل الحركة نعرض النص مباشرةً دون تحريك

    const chars = text.split("");
    const start = performance.now();
    let raf = 0;
    let last = 0;

    const loop = (now: number) => {
      if (now - last >= TICK_MS) {
        last = now;

        const progress = Math.min((now - start) / SCRAMBLE_MS, 1);
        const settled = Math.floor(progress * chars.length);

        setDisplay(
          chars
            .map((ch, i) =>
              i < settled || ch === " "
                ? ch
                : GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
            )
            .join(""),
        );
      }

      if (now - start < SCRAMBLE_MS) {
        raf = requestAnimationFrame(loop);
      } else {
        setDisplay(text);
      }
    };

    raf = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(raf);
  }, [text, reduce]);

  return (
    <span className="tabular-nums" dir="ltr">
      {reduce ? text : display}
    </span>
  );
}

export function NotFoundGlitch({
  className,
  code = DEFAULTS.code,
  title = DEFAULTS.title,
  description = DEFAULTS.description,
  homeHref,
  homeLabel,
  browseHref,
  browseLabel,
  onRetry,
  retryLabel,
}: NotFoundGlitchProps) {
  return (
    <Stage className={className}>
      <div className="group relative select-none font-mono font-bold leading-none tracking-tighter text-foreground [font-size:clamp(5rem,18vw,11rem)]">
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 text-[#ff0040] opacity-0 mix-blend-screen transition-[transform,opacity] duration-150 ease-out group-hover:translate-x-[3px] group-hover:opacity-70 motion-reduce:hidden"
        >
          <Scramble text={code} />
        </span>

        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 text-[#00e5ff] opacity-0 mix-blend-screen transition-[transform,opacity] duration-150 ease-out group-hover:-translate-x-[3px] group-hover:opacity-70 motion-reduce:hidden"
        >
          <Scramble text={code} />
        </span>

        <h1 className="relative">
          <Scramble text={code} />
        </h1>
      </div>

      <div className="flex flex-col items-center gap-2">
        <p className="text-lg font-semibold text-foreground">{title}</p>
        <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      </div>

      <Actions
        homeHref={homeHref}
        homeLabel={homeLabel}
        browseHref={browseHref}
        browseLabel={browseLabel}
        onRetry={onRetry}
        retryLabel={retryLabel}
      />
    </Stage>
  );
}
