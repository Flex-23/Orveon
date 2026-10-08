import { CheckCircle2, Info, Search, ShieldCheck, Sparkles, Truck } from "lucide-react";
import {
  getPublicCategories,
  getProducts,
  getLatestProductsCached,
  getProductsByCategoryCached,
} from "@/server/queries/products";
import { CategoryNav } from "@/components/store/category-nav";
import { ProductGrid } from "@/components/store/product-grid";

export const metadata = { title: "المتجر الإلكتروني | Orvion" };

function ReservedBanner({ reserved }: { reserved?: string }) {
  if (reserved === "success") {
    return (
      <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
        <CheckCircle2 className="h-5 w-5" />
        تم إرسال طلب الحجز بنجاح. سيتواصل معك الفريق قريباً.
      </div>
    );
  }
  if (reserved === "exists") {
    return (
      <div className="flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
        <Info className="h-5 w-5" />
        لديك بالفعل حجز قيد الانتظار لهذا المنتج.
      </div>
    );
  }
  return null;
}

// عنوان قسم أنيق: خط مميّز قصير + عنوان.
function SectionHead({ title }: { title: string }) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <span className="h-5 w-1 rounded-full bg-accent-strong" />
      <h2 className="text-xl font-bold tracking-tight">{title}</h2>
    </div>
  );
}

const trust = [
  { icon: ShieldCheck, label: "دفع آمن" },
  { icon: Truck, label: "تسليم سريع" },
  { icon: Sparkles, label: "جودة احترافية" },
];

export default async function StorePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; reserved?: string }>;
}) {
  const { q, category, reserved } = await searchParams;
  const categories = await getPublicCategories();
  const activeCategoryId = category ? Number(category) : undefined;

  // تجهيز بيانات المحتوى مسبقاً حسب الحالة
  let body: React.ReactNode;

  if (q) {
    const products = await getProducts({ q });
    body = (
      <section>
        <h2 className="mb-5 flex items-center gap-2 text-xl font-bold">
          <Search className="h-5 w-5 text-accent-strong" />
          نتائج البحث عن: «{q}»
        </h2>
        <ProductGrid products={products} empty="لا توجد منتجات مطابقة لبحثك." />
      </section>
    );
  } else if (activeCategoryId) {
    const products = await getProductsByCategoryCached(activeCategoryId);
    const catName = categories.find((c) => c.id === activeCategoryId)?.name ?? "القسم";
    body = (
      <section>
        <SectionHead title={catName} />
        <ProductGrid products={products} />
      </section>
    );
  } else {
    // الصفحة الافتراضية: منتجات متنوعة + قسمان محدّدان
    const latest = await getLatestProductsCached(8);
    const twoCats = categories.slice(0, 2);
    const twoCatProducts = await Promise.all(
      twoCats.map((c) => getProductsByCategoryCached(c.id, 4)),
    );
    body = (
      <div className="space-y-16">
        <section>
          <SectionHead title="وصل حديثاً" />
          <ProductGrid products={latest} />
        </section>

        {twoCats.map((cat, i) => (
          <section key={cat.id}>
            <SectionHead title={cat.name} />
            <ProductGrid
              products={twoCatProducts[i]}
              empty="لا توجد منتجات في هذا القسم بعد."
            />
          </section>
        ))}
      </div>
    );
  }

  return (
    <main className="flex-1">
      {/* هيدر المتجر — لوحة حديثة بخلفية mesh */}
      <header className="mesh-bg relative overflow-hidden border-b border-border">
        <div className="glow mesh-orb pointer-events-none absolute -left-20 -top-24 h-72 w-72 opacity-30" />
        <div className="relative mx-auto w-full max-w-7xl px-6 pb-8 pt-14">
          <span className="kicker spec text-accent-strong">
            <Sparkles className="h-3.5 w-3.5" />
            المتجر الإلكتروني
          </span>
          <h1 className="mt-4 max-w-2xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
            حلول رقمية جاهزة،
            <span className="text-accent-strong"> اشترِ وابدأ فوراً.</span>
          </h1>
          <p className="mt-3 max-w-xl text-muted-foreground">
            منتجات وقوالب وأنظمة مبنية باحتراف — تصفّحها واطلبها مباشرة.
          </p>

          <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
            {trust.map((t) => (
              <li
                key={t.label}
                className="flex items-center gap-2 text-sm font-medium text-muted-foreground"
              >
                <t.icon className="h-4 w-4 text-accent-strong" />
                {t.label}
              </li>
            ))}
          </ul>
        </div>

        {/* شريط الأقسام */}
        <div className="relative mx-auto w-full max-w-7xl px-6 pb-6">
          <CategoryNav categories={categories} activeId={activeCategoryId} />
        </div>
      </header>

      <div className="mx-auto w-full max-w-7xl px-6 py-12">
        {reserved && (
          <div className="mb-8">
            <ReservedBanner reserved={reserved} />
          </div>
        )}
        {body}
      </div>
    </main>
  );
}
