// صفّ عنصر في السلة مع أزرار التحكم بالكمية والحذف.
import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";
import type { CartItem, Product, Category } from "@/lib/generated/prisma";
import { formatPrice } from "@/lib/format";
import {
  incrementCartItem,
  decrementCartItem,
  removeCartItem,
} from "@/server/actions/cart";

type Item = CartItem & { product: Product & { category: Category | null } };

export function CartItemRow({ item }: { item: Item }) {
  const lineTotal = Number(item.product.price) * item.quantity;

  return (
    <div className="flex items-center gap-4 border-b border-black/10 py-4 dark:border-white/10">
      {/* صورة */}
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-indigo-500/10 to-fuchsia-500/10">
        {item.product.imageUrl ? (
          <Image
            src={item.product.imageUrl}
            alt={item.product.name}
            fill
            sizes="64px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-2xl font-black text-indigo-500/30">
            {item.product.name.charAt(0)}
          </div>
        )}
      </div>

      {/* الاسم والسعر */}
      <div className="min-w-0 flex-1">
        <h3 className="truncate font-semibold">{item.product.name}</h3>
        <p className="text-sm text-zinc-500">{formatPrice(item.product.price.toString())}</p>
      </div>

      {/* التحكم بالكمية */}
      <div className="flex items-center gap-2">
        <form action={decrementCartItem}>
          <input type="hidden" name="productId" value={item.productId} />
          <button
            type="submit"
            aria-label="إنقاص"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-black/10 hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
          >
            <Minus className="h-4 w-4" />
          </button>
        </form>
        <span className="w-8 text-center font-semibold">{item.quantity}</span>
        <form action={incrementCartItem}>
          <input type="hidden" name="productId" value={item.productId} />
          <button
            type="submit"
            aria-label="زيادة"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-black/10 hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
          >
            <Plus className="h-4 w-4" />
          </button>
        </form>
      </div>

      {/* إجمالي السطر */}
      <div className="hidden w-28 text-left font-bold text-indigo-600 dark:text-indigo-400 sm:block">
        {formatPrice(lineTotal)}
      </div>

      {/* حذف */}
      <form action={removeCartItem}>
        <input type="hidden" name="productId" value={item.productId} />
        <button
          type="submit"
          aria-label="حذف"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
