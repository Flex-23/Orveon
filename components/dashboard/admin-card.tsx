// بطاقة أدمن للعرض — التفاصيل والتعديل (والصلاحيات) في صفحة مستقلّة للأدمن.
import Link from "next/link";
import { FileText, Ban, CheckCircle2, MessageCircle } from "lucide-react";
import { toggleBanAction } from "@/server/actions/manager";
import { buildWhatsAppLink, buildAdminWelcomeMessage } from "@/lib/whatsapp";
import { PERMISSION_LABELS, type Permission } from "@/lib/auth/permissions";
import { DeleteAdminButton } from "./delete-admin-button";

export type AdminCardData = {
  id: number;
  name: string;
  phone: string;
  isBanned: boolean;
  /** كلمة المرور بعد فك تشفيرها في صفحة المدير — null للحسابات الأقدم من الميزة. */
  password: string | null;
  permissions: Record<Permission, boolean>;
};

const PERMS = Object.keys(PERMISSION_LABELS) as Permission[];

export function AdminCard({ admin }: { admin: AdminCardData }) {
  const enabledCount = PERMS.filter((k) => admin.permissions[k]).length;
  // رسالة بيانات الدخول — كاملة بكلمة المرور عند توفرها (نسخة مشفَّرة مفكوكة في صفحة المدير).
  const waLink = buildWhatsAppLink(
    admin.phone,
    buildAdminWelcomeMessage({
      name: admin.name,
      phone: admin.phone,
      password: admin.password ?? undefined,
    }),
  );

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-line bg-panel p-5 shadow-sm transition-colors hover:border-accent/30 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-accent/15 to-accent/5 font-bold text-accent-strong ring-1 ring-accent/10">
          {admin.name.charAt(0)}
        </span>
        <div className="min-w-0">
          <p className="flex items-center gap-2 font-semibold">
            <span className="truncate">{admin.name}</span>
            {admin.isBanned && (
              <span className="shrink-0 rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700 dark:bg-red-950/50 dark:text-red-300">
                محظور
              </span>
            )}
          </p>
          <p className="text-sm text-muted" dir="ltr">
            {admin.phone}
          </p>
          <p className="mt-0.5 text-xs text-muted">
            <span className="tabular">{enabledCount}</span> من {PERMS.length} صلاحية
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <Link
          href={`/dashboard/manager/admins/${admin.id}`}
          className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-2 text-sm font-medium text-accent-strong transition-all hover:scale-105 hover:border-accent/40 hover:bg-accent/10 active:scale-95"
        >
          <FileText className="h-3.5 w-3.5" />
          التفاصيل والصلاحيات
        </Link>
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="إرسال واتساب"
          title="إرسال بيانات الدخول عبر واتساب"
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-600/10 text-green-600 transition-all hover:scale-110 hover:bg-green-600 hover:text-white hover:shadow-md hover:shadow-green-600/30 active:scale-95 dark:text-green-400"
        >
          <MessageCircle className="h-4 w-4" />
        </a>
        <form action={toggleBanAction}>
          <input type="hidden" name="userId" value={admin.id} />
          <input type="hidden" name="ban" value={(!admin.isBanned).toString()} />
          <button
            type="submit"
            aria-label={admin.isBanned ? "رفع الحظر" : "حظر"}
            title={admin.isBanned ? "رفع الحظر" : "حظر"}
            className={`flex h-9 w-9 items-center justify-center rounded-lg transition-all hover:scale-110 hover:text-white hover:shadow-md active:scale-95 ${
              admin.isBanned
                ? "bg-emerald-600/10 text-emerald-600 hover:bg-emerald-600 hover:shadow-emerald-600/30 dark:text-emerald-400"
                : "bg-red-600/10 text-red-600 hover:bg-red-600 hover:shadow-red-600/30 dark:text-red-400"
            }`}
          >
            {admin.isBanned ? <CheckCircle2 className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
          </button>
        </form>
        <DeleteAdminButton adminId={admin.id} name={admin.name} />
      </div>
    </div>
  );
}
