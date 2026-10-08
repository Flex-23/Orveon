// شبكة عرض المنتجات.
import type { Product, Category } from "@/lib/generated/prisma";
import { ProductCard } from "./product-card";

type ProductWithCategory = Product & { category: Category | null };

export function ProductGrid({
  products,
  empty = "لا توجد منتجات.",
}: {
  products: ProductWithCategory[];
  empty?: string;
}) {
  if (products.length === 0) {
    return <p className="py-8 text-center text-zinc-500">{empty}</p>;
  }
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
