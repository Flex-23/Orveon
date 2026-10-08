import Link from "next/link";
import { FolderPlus, Tag, Package, Trash2 } from "lucide-react";
import { requirePermission } from "@/lib/auth/guards";
import { getCategoriesWithCounts } from "@/server/queries/admin";
import { deleteCategoryAction } from "@/server/actions/admin-products";
import { CategoryForm } from "@/components/dashboard/category-form";
import { ConfirmDeleteForm } from "@/components/dashboard/confirm-delete-form";

export const metadata = { title: "الأقسام | Orvion" };

export default async function CategoriesAdminPage() {
  await requirePermission("canManageProducts");
  const categories = await getCategoriesWithCounts();

  return (
    <main className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">الأقسام</h1>
        <p className="mt-1.5 text-muted">أنشئ أقسام متجرك ونظّم منتجاتك ضمنها.</p>
      </div>

      {/* إضافة قسم */}
      <section className="rounded-2xl border border-line bg-panel p-6 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 font-semibold">
          <FolderPlus className="h-5 w-5 text-accent-strong" />
          إضافة قسم
        </h2>
        <CategoryForm />
      </section>

      {/* قائمة الأقسام */}
      <section>
        <h2 className="mb-4 font-semibold">
          كل الأقسام <span className="tabular text-muted">({categories.length})</span>
        </h2>

        {categories.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-line p-8 text-center text-muted">
            لا توجد أقسام بعد. أضف أوّل قسم من الأعلى.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((c) => (
              <div
                key={c.id}
                className="group flex items-center justify-between gap-3 rounded-2xl border border-line bg-panel p-4 shadow-sm transition-colors hover:border-accent/30"
              >
                <Link
                  href={`/dashboard/store/products?cat=${c.id}`}
                  className="flex min-w-0 flex-1 items-center gap-3"
                  title="عرض منتجات هذا القسم"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent-strong transition-colors group-hover:bg-accent-strong group-hover:text-(--accent-contrast)">
                    <Tag className="h-5 w-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-semibold">{c.name}</span>
                    <span className="mt-0.5 flex items-center gap-1 text-xs text-muted">
                      <Package className="h-3 w-3" />
                      <span className="tabular">{c._count.products}</span> منتج
                    </span>
                  </span>
                </Link>

                <ConfirmDeleteForm
                  action={deleteCategoryAction}
                  fields={{ categoryId: c.id }}
                  message={`حذف قسم «${c.name}»؟`}
                  description="منتجات القسم تبقى موجودة لكن بدون قسم."
                  successMessage="تم حذف القسم."
                >
                  <button
                    type="submit"
                    aria-label={`حذف قسم ${c.name}`}
                    title="حذف القسم"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-line text-red-500 transition-all hover:border-red-500/40 hover:bg-red-500/10 active:scale-95"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </ConfirmDeleteForm>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
