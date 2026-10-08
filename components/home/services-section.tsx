"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Reveal } from "./reveal";
import { Cards, ServicesMobileCards, type ServiceForCard } from "./cards";

export function ServicesSection({ services }: { services: ServiceForCard[] }) {
  // قبل الترطيب (null) نرسم النسختين ويُخفي CSS غير المناسبة — كما كان تماماً.
  // بعده نرسم النسخة الفعلية فقط، فلا يدفع الجوال كلفة أنيميشن الديك المخفي.
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return (
    <section
      id="services"
      className="relative scroll-mt-24 border-y border-border py-28"
    >
      <div className="mesh-bg pointer-events-none absolute inset-0 opacity-60" />
      <div className="relative mx-auto max-w-7xl px-6">
        <Reveal blur>
          <header className="mb-14 flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-2xl">
              <span className="kicker text-sm font-semibold text-muted">
                خدماتنا
              </span>
              <h2 className="mt-5 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]">
                ما يمكننا بناؤه لك
              </h2>
              <p className="mt-4 text-pretty text-lg leading-relaxed text-muted">
                انقر على أي خدمة لمشاهدة الفيديوهات التعليمية والتفاصيل الكاملة.
              </p>
            </div>
            <Link
              href="/services"
              className="link-underline inline-flex items-center gap-2 font-semibold text-accent-strong"
            >
              كل الخدمات
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </header>
        </Reveal>
      </div>

      {/* الديك المبعثر — للشاشات المتوسطة فأكبر */}
      {isDesktop !== false && (
        <div className="relative mt-2 hidden md:block">
          <Cards services={services} />
        </div>
      )}

      {/* كروت بسيطة مكدّسة — للجوال */}
      {isDesktop !== true && (
        <div className="relative mx-auto mt-8 max-w-2xl px-6 md:hidden">
          <ServicesMobileCards services={services} />
        </div>
      )}
    </section>
  );
}
