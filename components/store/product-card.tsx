// كارد منتج: صورة + اسم + قسم + سعر + شارة الحالة + أزرار الإجراء.
import Image from "next/image";
import type { Product, Category } from "@/lib/generated/prisma";
import {
  effectiveStatus,
  STATUS_LABELS,
  STATUS_BADGE_CLASSES,
} from "@/lib/product-status";
import { formatPrice } from "@/lib/format";
import { ProductActions } from "./product-actions";

type ProductWithCategory = Product & { category: Category | null };

export function ProductCard({ product }: { product: ProductWithCategory }) {
  const status = effectiveStatus(product);

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-black/10 bg-background transition-shadow hover:shadow-lg dark:border-white/10">
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-indigo-500/10 to-fuchsia-500/10">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-5xl font-black text-indigo-500/30">
            {product.name.charAt(0)}
          </div>
        )}
        <span
          className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-semibold ${STATUS_BADGE_CLASSES[status]}`}
        >
          {STATUS_LABELS[status]}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        {product.category && (
          <span className="text-xs text-zinc-500">{product.category.name}</span>
        )}
        <h3 className="mt-0.5 font-semibold">{product.name}</h3>
        <p className="mt-1 text-lg font-bold text-indigo-600 dark:text-indigo-400">
          {formatPrice(product.price.toString())}
        </p>
        <div className="mt-3 flex-1" />
        <ProductActions productId={product.id} status={status} />
      </div>
    </article>
  );
}
