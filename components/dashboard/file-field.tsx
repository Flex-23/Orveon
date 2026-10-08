// حقل رفع ملفات موحّد الشكل (يُستخدم في نماذج لوحة المحتوى لمظهر متناسق).
import type { ComponentType } from "react";

type FileFieldProps = {
  icon: ComponentType<{ className?: string }>;
  label: string;
  hint?: string;
  name: string;
  accept?: string;
  multiple?: boolean;
};

export function FileField({
  icon: Icon,
  label,
  hint,
  name,
  accept,
  multiple,
}: FileFieldProps) {
  return (
    <div className="rounded-xl border border-line bg-background p-3 transition-colors focus-within:border-accent/50">
      <div className="mb-2.5 flex items-center gap-2.5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent-strong">
          <Icon className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-medium">{label}</p>
          {hint && <p className="text-xs text-muted">{hint}</p>}
        </div>
      </div>
      <input
        type="file"
        name={name}
        accept={accept}
        multiple={multiple}
        className="w-full text-sm text-muted file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-accent file:px-3 file:py-1.5 file:font-medium file:text-(--accent-contrast) hover:file:bg-accent-strong"
      />
    </div>
  );
}
