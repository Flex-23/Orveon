"use client";

// شريط البحث في الناف بار — يوجّه إلى المتجر مع نص البحث.
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";

export function SearchBar() {
  const router = useRouter();
  const [q, setQ] = useState("");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const query = q.trim();
    router.push(query ? `/store?q=${encodeURIComponent(query)}` : "/store");
  }

  return (
    <form onSubmit={onSubmit} className="relative w-full">
      <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        type="search"
        placeholder="ابحث في المتجر..."
        className="w-full rounded-full border border-black/10 bg-black/[0.03] py-2 pr-9 pl-4 text-sm outline-none transition-colors focus:border-indigo-500 focus:bg-transparent dark:border-white/15 dark:bg-white/5"
      />
    </form>
  );
}
