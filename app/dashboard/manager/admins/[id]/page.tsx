import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  User,
  Phone,
  CalendarDays,
  ShieldCheck,
  Ban,
  CheckCircle2,
  KeySquare,
  MessageCircle,
} from "lucide-react";
import { requireManager } from "@/lib/auth/guards";
import { getAdminById } from "@/server/queries/manager";
import { toggleBanAction } from "@/server/actions/manager";
import { buildWhatsAppLink, buildAdminWelcomeMessage } from "@/lib/whatsapp";
import { decryptCredential } from "@/lib/auth/credential-crypto";
import { PasswordRevealTile } from "@/components/dashboard/password-reveal";
import { PERMISSION_LABELS, type Permission } from "@/lib/auth/permissions";
import { formatDate } from "@/lib/format";
import { AdminEditForm } from "@/components/dashboard/admin-edit-form";
import { DeleteAdminButton } from "@/components/dashboard/delete-admin-button";

export const metadata = { title: "تفاصيل الأدمن | Orvion" };

const PERMS = Object.keys(PERMISSION_LABELS) as Permission[];

export default async function AdminDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireManager(); // تفاصيل الأدمن وإدارته للمدير فقط
  const { id } = await params;
  const admin = await getAdminById(Number(id));
  if (!admin) notFound();

  const permissions = Object.fromEntries(
    PERMS.map((k) => [k, Boolean(admin.permissions?.[k])]),
  ) as Record<Permission, boolean>;
  const enabled = PERMS.filter((k) => permissions[k]);

  // فك النسخة المشفَّرة (صفحة مقصورة على المدير) — null للحسابات الأقدم من هذه الميزة.
  const password = decryptCredential(admin.passwordEnc);

  // رسالة بيانات الدخول — كاملة بكلمة المرور عند توفرها.
  const waLink = buildWhatsAppLink(
    admin.phone,
    buildAdminWelcomeMessage({
      name: admin.name,
      phone: admin.phone,
      password: password ?? undefined,
    }),
  );

  return (
    <main className="mx-auto max-w-3xl space-y-6">
      <Link
        href="/dashboard/manager/admins"
        className="inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-accent-strong"
      >
        <ArrowRight className="h-4 w-4" />
        كل الأدمن
      </Link>

      {/* رأس البطاقة */}
      <header className="overflow-hidden rounded-3xl border border-line bg-panel shadow-sm">
        <div className="flex flex-col gap-5 bg-linear-to-bl from-accent/12 via-panel to-panel p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-accent to-accent-strong text-2xl font-black text-(--accent-contrast) shadow-sm">
              {admin.name.charAt(0)}
            </span>
            <div className="min-w-0">
              <h1 className="text-2xl font-bold tracking-tight">{admin.name}</h1>
              <p className="mt-1 text-sm text-muted" dir="ltr">
                {admin.phone}
              </p>
              <div className="mt-2">
                <StatusBadge banned={admin.isBanned} />
              </div>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-3.5 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-green-700"
            >
              <MessageCircle className="h-4 w-4" />
              إرسال بيانات الدخول
            </a>
            <form action={toggleBanAction}>
              <input type="hidden" name="userId" value={admin.id} />
              <input type="hidden" name="ban" value={(!admin.isBanned).toString()} />
              <button
                type="submit"
                className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium text-white transition-colors ${
                  admin.isBanned
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {admin.isBanned ? <CheckCircle2 className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                {admin.isBanned ? "رفع الحظر" : "حظر"}
              </button>
            </form>
            <DeleteAdminButton adminId={admin.id} name={admin.name} withLabel />
          </div>
        </div>
      </header>

      {/* بطاقات معلومات */}
      <div className="grid gap-3 sm:grid-cols-2">
        <InfoTile icon={User} label="الاسم" value={admin.name} />
        <InfoTile icon={Phone} label="رقم الهاتف (اسم الدخول)" value={admin.phone} mono />
        <PasswordRevealTile password={password} />
        <InfoTile icon={CalendarDays} label="تاريخ الإنشاء" value={formatDate(admin.createdAt)} mono />
        <InfoTile
          icon={KeySquare}
          label="عدد الصلاحيات"
          value={`${enabled.length} من ${PERMS.length}`}
          mono
        />
      </div>

      {/* ملخّص الصلاحيات الحالية */}
      <section className="rounded-2xl border border-line bg-panel p-5 shadow-sm">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <ShieldCheck className="h-4 w-4 text-accent-strong" />
          الصلاحيات الممنوحة
        </h2>
        <div className="flex flex-wrap gap-1.5">
          {enabled.length === 0 ? (
            <span className="text-sm text-muted">لا توجد صلاحيات ممنوحة.</span>
          ) : (
            enabled.map((k) => (
              <span
                key={k}
                className="rounded-full bg-accent/10 px-2.5 py-1 text-xs font-medium text-accent-strong"
              >
                {PERMISSION_LABELS[k]}
              </span>
            ))
          )}
        </div>
      </section>

      {/* تعديل البيانات والصلاحيات */}
      <AdminEditForm
        admin={{
          id: admin.id,
          name: admin.name,
          phone: admin.phone,
          permissions,
        }}
      />
    </main>
  );
}

function InfoTile({
  icon: Icon,
  label,
  value,
  mono,
}: {
  icon: typeof User;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-line bg-panel p-4 shadow-sm transition-colors hover:border-accent/30">
      <div className="flex items-center gap-2 text-xs font-medium text-muted">
        <Icon className="h-4 w-4 text-accent-strong" />
        {label}
      </div>
      <p className="mt-2 font-semibold wrap-break-word">
        {mono ? (
          <span className="tabular" dir="ltr">
            {value}
          </span>
        ) : (
          value
        )}
      </p>
    </div>
  );
}

function StatusBadge({ banned }: { banned: boolean }) {
  return banned ? (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700 dark:bg-red-950/50 dark:text-red-300">
      <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
      محظور
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
      نشط
    </span>
  );
}
