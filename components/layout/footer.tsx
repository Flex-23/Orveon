// فوتر الموقع — تصميم حديث: شريط دعوة علوي، أعمدة روابط، علامة مائية خلفية، وشريط سفلي.
import Link from "next/link";
import { MessageCircle, Phone } from "lucide-react";
import { BrainLogo } from "@/components/brand/brain-logo";

const quickLinks = [
  { href: "/", label: "الرئيسية" },
  { href: "/services", label: "الخدمات" },
  { href: "/store", label: "المتجر الإلكتروني" },
  { href: "/about", label: "حول أورفيون" },
];

const solutions = [
  { href: "/services", label: "مواقع الويب" },
  { href: "/services", label: "تطبيقات الجوال" },
  { href: "/store", label: "متاجر إلكترونية" },
  { href: "/services", label: "أنظمة إدارة" },
];

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-surface">
      {/* المحتوى الرئيسي + علامة مائية خلفية */}
      <div className="relative overflow-hidden">
        <span
          aria-hidden
          className="outline-text pointer-events-none absolute -bottom-6 left-1/2 -translate-x-1/2 select-none text-[26vw] font-black leading-none tracking-tighter opacity-[0.06] md:text-[18rem]"
        >
          ORVION
        </span>

        <div className="relative mx-auto grid max-w-7xl gap-10 px-6 py-14 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1.2fr]">
          {/* العلامة */}
          <div>
            <Link href="/" className="inline-flex items-center gap-2.5">
              <BrainLogo className="h-9 w-9 text-accent-strong" />
              <span className="text-xl font-extrabold tracking-tight">Orvion</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              شركة برمجيات تبني حلولاً رقمية احترافية: مواقع، تطبيقات، ومتاجر
              إلكترونية تنمو مع أعمالك.
            </p>
          </div>

          {/* روابط سريعة */}
          <nav>
            <h3 className="spec mb-4 text-muted-foreground">روابط سريعة</h3>
            <ul className="flex flex-col gap-3 text-sm">
              {quickLinks.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="link-underline text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* الحلول */}
          <nav>
            <h3 className="spec mb-4 text-muted-foreground">حلولنا</h3>
            <ul className="flex flex-col gap-3 text-sm">
              {solutions.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="link-underline text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* تواصل */}
          <div>
            <h3 className="spec mb-4 text-muted-foreground">تواصل معنا</h3>
            <p className="mb-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              للطلبات الخاصة والاستفسارات، فريق أورفيون بانتظارك.
            </p>
            <div className="flex flex-col gap-3">
              <a
                href="https://wa.me/9647734246928"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-medium transition-colors hover:border-accent-strong/40 hover:text-accent-strong"
              >
                <MessageCircle className="h-4 w-4 text-accent-strong" />
                واتساب
              </a>
              <a
                href="tel:+9647734246928"
                className="group inline-flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-medium transition-colors hover:border-accent-strong/40 hover:text-accent-strong"
              >
                <Phone className="h-4 w-4 text-accent-strong" />
                <span dir="ltr">+964 773 424 6928</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* الشريط السفلي */}
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-5 text-xs text-muted-foreground sm:flex-row">
          <span>© {new Date().getFullYear()} Orvion — أورفيون. جميع الحقوق محفوظة.</span>
          <span className="spec opacity-70">CRAFTED IN IRAQ</span>
        </div>
      </div>
    </footer>
  );
}
