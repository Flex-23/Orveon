"use client";

// قائمة اختيار حالة تُرسل النموذج تلقائياً عند التغيير (تستدعي إجراء خادم).
import { useRef } from "react";

type Option = { value: string; label: string };

export function StatusSelect({
  action,
  idName,
  idValue,
  name,
  value,
  options,
}: {
  action: (formData: FormData) => void | Promise<void>;
  idName: string;
  idValue: number;
  name: string;
  value: string;
  options: Option[];
}) {
  const ref = useRef<HTMLFormElement>(null);
  return (
    <form action={action} ref={ref}>
      <input type="hidden" name={idName} value={idValue} />
      <select
        name={name}
        defaultValue={value}
        onChange={() => ref.current?.requestSubmit()}
        className="rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-indigo-500 dark:border-white/15 dark:[&>option]:bg-zinc-900"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </form>
  );
}
