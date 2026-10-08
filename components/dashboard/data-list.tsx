// قائمة بيانات متجاوبة: جدول مرتّب على الشاشات الكبيرة (md+)،
// وبطاقات مكدّسة متناسقة على الجوال — بلا تمرير أفقي.
//
// الاستخدام:
//   <DataList cols="2fr 1.4fr 0.9fr auto" headers={["الاسم", "الخدمة", "الحالة", ""]}>
//     <DataRow cols="2fr 1.4fr 0.9fr auto">
//       <div>...الخلية الرئيسية...</div>
//       <DataCell label="الخدمة">{value}</DataCell>
//       ...
//     </DataRow>
//   </DataList>
//
// لاحظ: نمرّر نفس قيمة cols للحاوية وللصفوف ليتطابق عرض الأعمدة مع رؤوسها.
import type { CSSProperties, ReactNode } from "react";

export function DataList({
  cols,
  headers,
  children,
}: {
  cols: string;
  headers?: ReactNode[];
  children: ReactNode;
}) {
  const grid: CSSProperties = { gridTemplateColumns: cols };
  return (
    <div className="md:overflow-hidden md:rounded-2xl md:border md:border-line md:bg-panel md:shadow-sm">
      {headers && (
        <div
          style={grid}
          className="hidden gap-4 border-b border-line bg-foreground/3 px-5 py-3 text-xs font-semibold tracking-wide text-muted md:grid"
        >
          {headers.map((h, i) => (
            <div key={i} className="min-w-0">
              {h}
            </div>
          ))}
        </div>
      )}
      <div className="space-y-3 md:space-y-0">{children}</div>
    </div>
  );
}

export function DataRow({
  cols,
  children,
  className = "",
}: {
  cols: string;
  children: ReactNode;
  className?: string;
}) {
  const grid: CSSProperties = { gridTemplateColumns: cols };
  return (
    <div
      style={grid}
      className={
        "flex flex-col gap-3 rounded-2xl border border-line bg-panel p-4 shadow-sm transition-colors hover:border-accent/30 " +
        "md:grid md:items-center md:gap-4 md:rounded-none md:border-0 md:border-b md:border-line md:bg-transparent md:p-0 md:px-5 md:py-4 md:shadow-none md:transition-colors md:last:border-b-0 md:hover:border-line md:hover:bg-foreground/2 " +
        className
      }
    >
      {children}
    </div>
  );
}

// خلية ثانوية: على الجوال تُعرض كسطر «العنوان ⟷ القيمة»؛ على الديسكتوب قيمة فقط.
export function DataCell({
  label,
  children,
  className = "",
}: {
  label?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={
        "flex items-center justify-between gap-3 md:flex-col md:items-start md:justify-center " + className
      }
    >
      {label ? (
        <span className="shrink-0 text-xs font-medium text-muted md:hidden">{label}</span>
      ) : null}
      <div className="min-w-0">{children}</div>
    </div>
  );
}
