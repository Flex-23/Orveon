import Image from "next/image";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { ArrowRight, CalendarClock } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { effectiveStatus } from "@/lib/product-status";
import { formatPrice } from "@/lib/format";
import { ReservationForm } from "@/components/store/reservation-form";

export const metadata = { title: "حجز منتج | Orvion" };

export default async function ReserveProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const productId = Number(id);
  if (!Number.isInteger(productId)) notFound();

  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=/store/reserve/${productId}`);

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) notFound();

  // الحجز متاح فقط للمنتجات بحالة "قريباً".
  if (effectiveStatus(product) !== "coming_soon") redirect("/store");

  // إن كان للمستخدم حجز قيد الانتظار لهذا المنتج، أعده للمتجر برسالة.
  const existing = await prisma.reservation.findFirst({
    where: { userId: user.id, productId, status: "pending" },
  });
  if (existing) redirect("/store?reserved=exists");

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-10">
      <Link
        href="/store"
        className="mb-4 inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-indigo-600"
      >
        <ArrowRight className="h-4 w-4" />
        العودة إلى المتجر
      </Link>

      <h1 className="mb-1 flex items-center gap-2 text-2xl font-bold">
        <CalendarClock className="h-6 w-6 text-amber-500" />
        حجز منتج
      </h1>
      <p className="mb-6 text-zinc-600 dark:text-zinc-400">
        أكمل بيانات الحجز وسيتواصل معك الفريق عند توفّر المنتج.
      </p>

      {/* ملخّص المنتج */}
      <div className="mb-6 flex items-center justify-between rounded-2xl border border-black/10 p-4 dark:border-white/10">
        <div className="flex items-center gap-3">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-indigo-500/10 to-fuchsia-500/10">
            {product.imageUrl ? (
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                sizes="64px"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-2xl font-black text-indigo-500/30">
                {product.name.charAt(0)}
              </div>
            )}
          </div>
          <div>
            <h2 className="font-semibold">{product.name}</h2>
            <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
              {formatPrice(product.price.toString())}
            </p>
          </div>
        </div>
      </div>

      <ReservationForm
        productId={product.id}
        defaultName={user.name}
        defaultPhone={user.phone}
        defaultGovernorate={user.governorate ?? ""}
      />
    </main>
  );
}
