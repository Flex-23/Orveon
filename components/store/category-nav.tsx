// أزرار التنقّل بين الأقسام (روابط فلترة) — شرائح حديثة بلون مميّز.
import Link from "next/link";
import type { Category } from "@/lib/generated/prisma";

export function CategoryNav({
  categories,
  activeId,
}: {
  categories: Category[];
  activeId?: number;
}) {
  const chip = (active: boolean) =>
    `whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all ${
      active
        ? "bg-accent-strong text-[var(--accent-contrast)] shadow-glow"
        : "border border-border bg-background text-muted-foreground hover:border-accent-strong/40 hover:text-foreground"
    }`;

  return (
    <div className="scroll-x flex gap-2 pb-1">
      <Link href="/store" className={chip(!activeId)}>
        كل المنتجات
      </Link>
      {categories.map((c) => (
        <Link
          key={c.id}
          href={`/store?category=${c.id}`}
          className={chip(activeId === c.id)}
        >
          {c.name}
        </Link>
      ))}
    </div>
  );
}
