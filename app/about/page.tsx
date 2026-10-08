import Link from "next/link";
import { ArrowUpLeft, Gauge, Layers, ShieldCheck } from "lucide-react";
import { Reveal } from "@/components/home/reveal";

export const metadata = { title: "حول | Orvion" };

const principles = [
  {
    icon: Layers,
    title: "تصميم بمعنى",
    text: "كل تفصيلة لها سبب. لا زخرفة بلا وظيفة.",
  },
  {
    icon: Gauge,
    title: "أداء بلا مساومة",
    text: "سرعة تُحَسّ، لا أرقام على ورق فقط.",
  },
  {
    icon: ShieldCheck,
    title: "نبقى بعد التسليم",
    text: "شراكة تقنية مستمرة، لا صفقة عابرة.",
  },
];

export default function AboutPage() {
  return (
    <main className="relative flex-1 overflow-hidden">
      {/* البطل */}
      <section className="mesh-bg relative px-6 pt-24 pb-16 text-center">
        <div className="glow mesh-orb pointer-events-none absolute left-1/2 top-0 h-80 w-80 -translate-x-1/2 opacity-30" />
        <div className="relative mx-auto max-w-3xl">
          <Reveal>
            <span className="kicker spec justify-center text-accent-strong">
              حول أورفيون
            </span>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="mt-8 text-4xl font-extrabold leading-[1.45] sm:text-6xl sm:leading-[1.3]">
              نبني برمجيات
              <br />
              <span className="text-accent-strong">يثق بها أصحابها.</span>
            </h1>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mx-auto mt-8 max-w-xl text-lg leading-loose text-muted-foreground">
              مواقع، تطبيقات، ومتاجر إلكترونية — نصنعها لتعمل، وتُباع، وتنمو.
            </p>
          </Reveal>
        </div>
      </section>

      {/* بيان مفرد قوي */}
      <section className="border-y border-border bg-surface px-6 py-20">
        <Reveal className="mx-auto max-w-3xl text-center">
          <p className="text-2xl font-bold leading-snug sm:text-3xl">
            «نحوّل الفكرة إلى منتج، والمنتج إلى{" "}
            <span className="text-accent-strong">أثر يدوم</span>.»
          </p>
        </Reveal>
      </section>

      {/* المبادئ */}
      <section className="mx-auto max-w-5xl px-6 py-20">
        <div className="grid gap-6 sm:grid-cols-3">
          {principles.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.1}>
              <div className="spotlight-card group h-full rounded-2xl border border-border bg-card p-7 transition-colors hover:border-accent-strong/40">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-accent-strong/10 text-accent-strong transition-transform group-hover:scale-110">
                  <p.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-5 text-lg font-bold">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {p.text}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* دعوة ختامية */}
      <section className="px-6 pb-24">
        <Reveal className="mx-auto max-w-3xl">
          <div className="edge-glow relative overflow-hidden rounded-3xl bg-accent-strong px-8 py-12 text-center text-[var(--accent-contrast)]">
            <h2 className="text-2xl font-extrabold sm:text-3xl">
              جاهز نبدأ معك؟
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm opacity-90">
              اطّلع على ما نقدّمه، أو تصفّح متجرنا للحلول الجاهزة.
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/services"
                className="inline-flex items-center gap-2 rounded-full bg-[var(--accent-contrast)] px-6 py-3 text-sm font-semibold text-accent-strong transition-transform active:scale-[0.97]"
              >
                خدماتنا
                <ArrowUpLeft className="h-4 w-4" />
              </Link>
              <Link
                href="/store"
                className="inline-flex items-center gap-2 rounded-full border border-[var(--accent-contrast)]/30 px-6 py-3 text-sm font-semibold transition-colors hover:bg-[var(--accent-contrast)]/10"
              >
                المتجر
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </main>
  );
}
