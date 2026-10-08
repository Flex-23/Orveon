"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Sparkles, X } from "lucide-react";
import type { WorkForCard } from "@/server/queries/content";
import BorderGlow from "@/components/ui/border-glow";
import { TrialRequestForm } from "@/components/store/trial-request-form";
import { Reveal } from "./reveal";

// ألوان التوهّج مشتقّة من هوية العلامة (بنفسجي/نيلي) لتنسجم الكروت مع باقي الموقع.
const GLOW_COLORS = ["#8b88ff", "#c084fc", "#38bdf8"];
const GLOW_HSL = "245 85 75";
const CARD_BG = "#15121d";

/** بيانات الزبون المُسجّلة (إن وُجدت) لتعبئة نموذج الطلب تلقائياً. */
export type TrialUser = {
  name: string;
  phone: string;
  governorate: string | null;
} | null;

function WorkCard({
  work,
  index,
  onRequest,
}: {
  work: WorkForCard;
  index: number;
  onRequest: (work: WorkForCard) => void;
}) {
  return (
    <BorderGlow
      colors={GLOW_COLORS}
      glowColor={GLOW_HSL}
      backgroundColor={CARD_BG}
      borderRadius={28}
      glowRadius={36}
      edgeSensitivity={22}
      glowIntensity={1.5}
      coneSpread={30}
      animated
      className="group h-full"
    >
      <div className="flex h-full flex-col">
        <div className="relative aspect-16/10 overflow-hidden rounded-t-[27px]">
          {work.imageUrl ? (
            <Image
              src={work.imageUrl}
              alt={`مشروع ${work.title}`}
              fill
              sizes="(min-width: 768px) 33vw, 100vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
            />
          ) : (
            <div className="relative flex h-full items-center justify-center bg-linear-to-br from-[#8b88ff]/20 via-transparent to-[#38bdf8]/10">
              <span className="relative text-7xl font-black text-white/20">{work.title.charAt(0)}</span>
            </div>
          )}
          <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/55 via-transparent to-transparent" />
          <span className="absolute right-5 top-5 font-mono text-sm tabular-nums text-white/60 [direction:ltr]">
            {String(index).padStart(2, "0")}
          </span>
        </div>

        <div className="relative z-10 flex flex-1 flex-col justify-center p-8 sm:p-9">
          <h3 className="text-2xl font-bold tracking-tight text-white transition-colors group-hover:text-[#bcb9ff] sm:text-[1.7rem]">
            {work.title}
          </h3>
          {work.description && (
            <p className="mt-3 max-w-xl text-pretty text-base leading-relaxed text-white/55 line-clamp-3">
              {work.description}
            </p>
          )}
          <span className="mt-6 inline-block h-1 w-10 rounded-full bg-[#8b88ff]/50 transition-all duration-300 group-hover:w-16 group-hover:bg-[#8b88ff]" />

          <button
            type="button"
            onClick={() => onRequest(work)}
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:border-[#8b88ff]/60 hover:bg-[#8b88ff]/15"
          >
            <Sparkles className="h-4 w-4 text-[#bcb9ff]" />
            طلب نسخة تجريبية
          </button>
        </div>
      </div>
    </BorderGlow>
  );
}

function TrialModal({
  work,
  user,
  onClose,
}: {
  work: WorkForCard;
  user: TrialUser;
  onClose: () => void;
}) {
  // إغلاق بمفتاح Escape + قفل تمرير الصفحة أثناء فتح النافذة.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl border border-white/10 bg-[#15121d] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* صورة وشرح العمل المطلوب */}
        <div className="relative h-32 overflow-hidden sm:h-36">
          {work.imageUrl ? (
            <Image
              src={work.imageUrl}
              alt={`مشروع ${work.title}`}
              fill
              sizes="448px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-linear-to-br from-[#8b88ff]/20 via-transparent to-[#38bdf8]/10">
              <span className="text-6xl font-black text-white/20">{work.title.charAt(0)}</span>
            </div>
          )}
          <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-[#15121d] via-[#15121d]/30 to-transparent" />
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق"
            className="absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white/80 backdrop-blur transition-colors hover:bg-black/70 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6">
          <span className="text-xs font-semibold text-[#bcb9ff]">طلب نسخة تجريبية</span>
          <h3 className="mt-1 text-xl font-bold tracking-tight text-white">{work.title}</h3>
          {work.description && (
            <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-white/55">{work.description}</p>
          )}

          <div className="mt-5 border-t border-white/10 pt-5">
            <p className="mb-4 text-sm text-white/60">
              بياناتك مأخوذة من حسابك — يمكنك تعديلها قبل الإرسال.
            </p>
            <TrialRequestForm
              workId={work.id}
              defaultName={user?.name ?? ""}
              defaultPhone={user?.phone ?? ""}
              defaultGovernorate={user?.governorate ?? ""}
              onSuccess={onClose}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function WorksSection({ works, user }: { works: WorkForCard[]; user: TrialUser }) {
  const [activeWork, setActiveWork] = useState<WorkForCard | null>(null);

  return (
    <section id="works" className="mx-auto max-w-7xl scroll-mt-24 px-6 py-28">
      <Reveal blur>
        <header className="mb-12 max-w-2xl">
          <span className="kicker text-sm font-semibold text-muted">أعمالنا</span>
          <h2 className="mt-5 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]">
            مشاريع تم أنجزناها
          </h2>
          <p className="mt-4 text-pretty text-lg leading-relaxed text-muted">
            مجموعة مختارة من المشاريع التي صمّمناها وبنيناها لعملائنا — من الفكرة الأولى حتى الإطلاق.
          </p>
        </header>
      </Reveal>

      {works.length === 0 ? (
        <p className="text-muted">لا توجد أعمال لعرضها بعد.</p>
      ) : (
        <div className="grid gap-8 md:grid-cols-3">
          {works.map((work, i) => (
            <Reveal key={work.id} delay={i * 0.06}>
              <WorkCard work={work} index={i + 1} onRequest={setActiveWork} />
            </Reveal>
          ))}
        </div>
      )}

      {activeWork && (
        <TrialModal work={activeWork} user={user} onClose={() => setActiveWork(null)} />
      )}
    </section>
  );
}
