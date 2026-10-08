import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { getCartWithItems } from "@/server/queries/cart";
import { formatPrice } from "@/lib/format";
import { CheckoutForm } from "./checkout-form";

export const metadata = { title: "إتمام الطلب | Orvion" };

export default async function CheckoutPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/checkout");

  const cart = await getCartWithItems(user.id);
  const items = cart?.items ?? [];
  if (items.length === 0) redirect("/cart");

  const total = items.reduce(
    (sum, i) => sum + Number(i.product.price) * i.quantity,
    0,
  );

  return (
    <main className="mx-auto grid w-full max-w-5xl flex-1 gap-8 px-6 py-10 lg:grid-cols-[1fr_340px]">
      {/* النموذج */}
      <section>
        <h1 className="mb-6 text-2xl font-bold">إتمام الطلب</h1>
        <CheckoutForm
          defaultName={user.name}
          defaultPhone={user.phone}
          defaultGovernorate={user.governorate ?? ""}
        />
      </section>

      {/* ملخّص الطلب */}
      <aside className="h-fit rounded-2xl border border-black/10 p-5 dark:border-white/10">
        <h2 className="mb-4 font-semibold">ملخّص الطلب</h2>
        <ul className="flex flex-col gap-3">
          {items.map((i) => (
            <li key={i.id} className="flex justify-between gap-2 text-sm">
              <span className="min-w-0 truncate">
                {i.product.name} <span className="text-zinc-500">×{i.quantity}</span>
              </span>
              <span className="shrink-0 font-medium">
                {formatPrice(Number(i.product.price) * i.quantity)}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex justify-between border-t border-black/10 pt-4 font-bold dark:border-white/10">
          <span>الإجمالي</span>
          <span className="text-indigo-600 dark:text-indigo-400">{formatPrice(total)}</span>
        </div>
      </aside>
    </main>
  );
}
