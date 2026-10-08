import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Reveal } from "./reveal";
import { ProcessLedger, type ProcessStep } from "./process-ledger";

// قسم تقديمي ثابت — لا مصدر بيانات له، محتوى عربي مدروس
const steps: ProcessStep[] = [
  {
    n: "01",
    title: "اكتشاف وتخطيط",
    desc: "نفهم فكرتك وجمهورك وأهداف عملك، ونرسم خارطة طريق واضحة لبداية العمل",
  },
  {
    n: "02",
    title: "تصميم التجربة",
    desc: "واجهات وتجربة استخدام تجمع بين الجمال والوضوح، مع نماذج تفاعلية قابلة للمراجعة معك.",
  },
  {
    n: "03",
    title: "التطوير والبناء",
    desc: " نظام حديث وبنية قابلة للتوسّع بأحدث التقنيات، مع اختبار دقيق في كل مرحلة من البناء",
  },
  {
    n: "04",
    title: "الإطلاق والدعم",
    desc: "دعم متواصل علئ مدار الوقت بعد تسليم النظام من اجل تقديم افضل خدمة",
  },
];

export function ProcessSection() {
  return (
    <section
      id="process"
      className="relative scroll-mt-24 border-t border-border py-28"
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          {/* العمود التعريفي */}
          <div className="lg:col-span-4">
            <Reveal blur>
              <div className="lg:sticky lg:top-28">
                <span className="kicker text-sm font-semibold text-muted">
                  كيف نعمل
                </span>
                <h2 className="mt-5 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]">
                  رحلة مدروسة من الفكرة إلى الإطلاق
                </h2>
                <p className="mt-4 text-pretty text-lg leading-relaxed text-muted">
                  منهجية واضحة بأربع مراحل تضمن جودة المنتج وراحة بالك في كل خطوة.
                </p>
                <Link
                  href="/services"
                  className="link-underline mt-7 inline-flex items-center gap-2 font-semibold text-accent-strong"
                >
                  تعرّف على خدماتنا
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </div>
            </Reveal>
          </div>

          {/* قائمة المراحل — جزء تفاعلي مع مسار تقدّم مرتبط بالتمرير */}
          <div className="lg:col-span-8">
            <ProcessLedger steps={steps} />
          </div>
        </div>
      </div>
    </section>
  );
}
