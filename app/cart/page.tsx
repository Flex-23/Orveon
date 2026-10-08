import Link from "next/link";
import { redirect } from "next/navigation";
import { ShoppingCart, ArrowLeft } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/session";
import { getCartWithItems } from "@/server/queries/cart";
import { formatPrice } from "@/lib/format";
import { CartItemRow } from "@/components/cart/cart-item-row";

export const metadata = { title: "سلة المشتريات | Orvion" };

export default async function CartPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/cart");

  const cart = await getCartWithItems(user.id);
  const items = cart?.items ?? [];
  const total = items.reduce(
    (sum, i) => sum + Number(i.product.price) * i.quantity,
    0,
  );

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
      <h1 className="mb-6 flex items-center gap-2 text-2xl font-bold">
        <ShoppingCart className="h-6 w-6" />
        سلة المشتريات
      </h1>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-black/15 py-16 text-center dark:border-white/15">
          <p className="text-zinc-500">سلتك فارغة.</p>
          <Link
            href="/store"
            className="mt-4 inline-flex items-center gap-1 font-medium text-indigo-600 hover:underline"
          >
            تصفّح المتجر
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <>
          <div className="rounded-2xl border border-black/10 px-5 dark:border-white/10">
            {items.map((item) => (
              <CartItemRow key={item.id} item={item} />
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between rounded-2xl bg-black/[0.03] p-5 dark:bg-white/5">
            <span className="text-lg font-semibold">الإجمالي</span>
            <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {formatPrice(total)}
            </span>
          </div>

          <Link
            href="/checkout"
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-indigo-700"
          >
            متابعة للدفع
          </Link>
        </>
      )}
    </main>
  );
}
