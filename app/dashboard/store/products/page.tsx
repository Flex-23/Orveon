import Link from "next/link";
import { Filter, PackagePlus, Tag, Settings2 } from "lucide-react";
import { requirePermission } from "@/lib/auth/guards";
import { getAllProducts, getCategoriesWithCounts } from "@/server/queries/admin";
import { ProductForm } from "@/components/dashboard/product-form";
import { ProductRow } from "@/components/dashboard/product-row";
import { DataList } from "@/components/dashboard/data-list";

export const metadata = { title: "المنتجات | Orvion" };

const COLS = "minmax(0,2.2fr) minmax(0,1.1fr) 0.7fr 0.9fr 0.9fr auto";

export default async function ProductsAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string }>;
}) {
  await requirePermission("canManageProducts");
  const { cat } = await searchParams;
  const catId = cat ? Number(cat) : undefined;

  const [products, categories] = await Promise.all([
    getAllProducts(catId),
    getCategoriesWithCounts(),
  ]);

  const activeCat = catId ? categories.find((c) => c.id === catId) : undefined;
  const catOptions = categories.map((c) => ({ id: c.id, name: c.name }));
  const rows = products.map((p) => ({
    id: p.id,
    name: p.name,
    categoryId: p.categoryId,
    categoryName: p.category?.name ?? null,
    quantity: p.quantity,
    price: p.price.toString(),
    status: p.status,
    imageUrl: p.imageUrl,
  }));

  return (
    <main className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">المنتجات</h1>
        <p className="mt-1.5 text-sm text-muted sm:text-base">
          أضف منتجاتك وعدّلها وأدِر كميّاتها وأسعارها.
        </p>
      </div>

      {/* فلترة سريعة حسب القسم — إدارة الأقسام في صفحتها المستقلّة */}
      {categories.length > 0 && (
        <section className="flex flex-wrap items-center gap-2">
          <Link
            href="/dashboard/store/products"
            className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
              !catId
                ? "border-accent-strong bg-accent-strong text-(--accent-contrast)"
                : "border-line hover:bg-foreground/5"
            }`}
          >
            كل المنتجات
          </Link>
          {categories.map((c) => {
            const active = catId === c.id;
            return (
              <Link
                key={c.id}
                href={`/dashboard/store/products?cat=${c.id}`}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                  active
                    ? "border-accent bg-accent/10 text-accent-strong"
                    : "border-line hover:bg-foreground/5"
                }`}
              >
                <Tag className="h-3.5 w-3.5" />
                {c.name}
                <span className="tabular text-xs text-muted">{c._count.products}</span>
              </Link>
            );
          })}
          <Link
            href="/dashboard/store/categories"
            className="ms-auto inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-sm font-medium text-accent-strong transition-colors hover:bg-accent/10"
          >
            <Settings2 className="h-3.5 w-3.5" />
            إدارة الأقسام
          </Link>
        </section>
      )}

      {/* إضافة مادة */}
      <section className="rounded-2xl border border-line bg-panel p-6 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 font-semibold">
          <PackagePlus className="h-5 w-5 text-accent-strong" />
          إضافة مادة
        </h2>
        <ProductForm categories={catOptions} />
      </section>

      {/* قائمة المنتجات */}
      <section>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-semibold">
            المنتجات <span className="tabular text-muted">({products.length})</span>
          </h2>
          {activeCat && (
            <div className="flex items-center gap-2 text-sm">
              <span className="flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1 font-medium text-accent-strong">
                <Filter className="h-3.5 w-3.5" />
                {activeCat.name}
              </span>
              <Link href="/dashboard/store/products" className="text-muted hover:text-foreground">
                إزالة الفلتر
              </Link>
            </div>
          )}
        </div>

        {rows.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-line p-8 text-center text-muted">
            {activeCat ? "لا توجد منتجات في هذا القسم." : "لا توجد منتجات بعد."}
          </p>
        ) : (
          <DataList
            cols={COLS}
            headers={[
              "المادة",
              "القسم",
              "الكمية",
              "السعر",
              "الحالة",
              <span key="a" className="block text-end">إجراءات</span>,
            ]}
          >
            {rows.map((p) => (
              <ProductRow key={p.id} product={p} categories={catOptions} cols={COLS} />
            ))}
          </DataList>
        )}
      </section>
    </main>
  );
}
