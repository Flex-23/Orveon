// أدوات تنسيق العرض — أرقام إنجليزية مع فواصل الآلاف.

/** تنسيق السعر بأرقام إنجليزية وفواصل آلاف وعملة الدينار العراقي. يقبل Decimal/number/string. */
export function formatPrice(value: number | string): string {
  const num = typeof value === "string" ? Number(value) : value;
  const safe = Number.isFinite(num) ? num : 0;
  return `${safe.toLocaleString("en-US", { maximumFractionDigits: 0 })} د.ع`;
}

/** تنسيق رقم بأرقام إنجليزية وفواصل آلاف (بلا عملة). */
export function formatNumber(value: number | string): string {
  const num = typeof value === "string" ? Number(value) : value;
  const safe = Number.isFinite(num) ? num : 0;
  return safe.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

/** تنسيق التاريخ بأرقام إنجليزية (يوم/شهر/سنة). */
export function formatDate(value: Date | string): string {
  return new Date(value).toLocaleDateString("en-GB");
}

/** تنسيق التاريخ والوقت بأرقام إنجليزية. */
export function formatDateTime(value: Date | string): string {
  return new Date(value).toLocaleString("en-GB");
}

/** يحوّل تاريخاً إلى صيغة حقل <input type="date"> (YYYY-MM-DD)، أو "" إن لم يوجد. */
export function toDateInputValue(value: Date | string | null | undefined): string {
  if (!value) return "";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
}
