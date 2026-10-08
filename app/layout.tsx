import type { Metadata } from "next";
import { Cairo, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { FooterGate } from "@/components/layout/footer-gate";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";

// خط النصّ والعناوين العربية — يدعم RTL ويملك أوزاناً ثقيلة قوية
const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  display: "swap",
});

// خط لاتيني هندسي للوسوم التقنية والأرقام (WEB / 99.9% ...)
const spaceGrotesk = Space_Grotesk({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  // يحوّل روابط OG/التغريدات النسبية إلى مطلقة (مطلوب لمعاينات المشاركة)
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: "Orvion — ستوديو تطوير برمجيات",
  description:
    "أورفيون ستوديو لتطوير البرمجيات: مواقع، تطبيقات، متاجر إلكترونية، وأنظمة إدارية — نحوّل الفكرة إلى منتج جاهز للإطلاق.",
  openGraph: {
    title: "Orvion — ستوديو تطوير برمجيات",
    description:
      "نبني المنتجات الرقمية التي يعتمد عليها عملك: مواقع، تطبيقات، متاجر، وأنظمة.",
    locale: "ar",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={cn("h-full", "antialiased", cairo.variable, spaceGrotesk.variable, "font-sans")}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Navbar />
          {children}
          <FooterGate>
            <Footer />
          </FooterGate>
          <Toaster position="top-center" richColors dir="rtl" />
        </ThemeProvider>
      </body>
    </html>
  );
}
