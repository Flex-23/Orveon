import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  FileArchive,
  Download,
  Trash2,
  FolderUp,
  User,
  KeyRound,
  Layers,
  Phone,
  MapPin,
  CalendarDays,
  CalendarClock,
  ShieldCheck,
  MessageCircle,
  Pencil,
  Wallet,
} from "lucide-react";
import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/auth/guards";
import { canAccessDues, hasPermission } from "@/lib/auth/permissions";
import { getSubscriberById } from "@/server/queries/manager";
import { deleteMemberProgramAction } from "@/server/actions/manager";
import { buildWhatsAppLink, buildWelcomeMessage } from "@/lib/whatsapp";
import { formatDate, formatPrice } from "@/lib/format";
import { ConfirmDeleteForm } from "@/components/dashboard/confirm-delete-form";
import { MemberProgramForm } from "@/components/dashboard/member-program-form";
import { MemberDues } from "@/components/dashboard/member-dues";

export const metadata = { title: "تفاصيل المشترك | Orvion" };

export default async function MemberDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireStaff();
  // إدارة المشتركين تتيح كل شيء؛ صلاحية المستحقات تتيح قسم الدفع فقط.
  const canMembers = hasPermission(user, "canManageMembers");
  if (!canMembers && !canAccessDues(user)) redirect("/dashboard");

  const { id } = await params;
  const member = await getSubscriberById(Number(id));
  if (!member) notFound();

  const sub = member.subscriptions[0];
  const totalAmount = Number(sub?.totalAmount ?? 0);
  const paidAmount = Number(sub?.paidAmount ?? 0);
  const remaining = Math.max(0, totalAmount - paidAmount);
  // باقي المبالغ الإضافية + الإجمالي المستحق (اشتراك أصلي + إضافي).
  const extrasRemaining = member.extraCharges.reduce(
    (s, c) => s + Math.max(0, Number(c.amount) - Number(c.paidAmount)),
    0,
  );
  const totalDue = remaining + extrasRemaining;
  const waLink = sub
    ? buildWhatsAppLink(
        member.phone,
        buildWelcomeMessage({
          name: member.name,
          username: member.loginCode ?? member.phone,
          password: sub.loginCode ?? "",
          serviceName: sub.serviceName,
        }),
      )
    : null;

  return (
    <main className="mx-auto max-w-3xl space-y-6">
      <Link
        href={canMembers ? "/dashboard/manager/members" : "/dashboard/manager/dues"}
        className="inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-accent-strong"
      >
        <ArrowRight className="h-4 w-4" />
        {canMembers ? "كل المشتركين" : "مستحقات الدفع"}
      </Link>

      {/* رأس البطاقة — متدرّج مع الحالة وزر واتساب */}
      <header className="overflow-hidden rounded-3xl border border-line bg-panel shadow-sm">
        <div className="flex flex-col gap-5 bg-linear-to-bl from-accent/12 via-panel to-panel p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-accent to-accent-strong text-2xl font-black text-(--accent-contrast) shadow-sm">
              {member.name.charAt(0)}
            </span>
            <div className="min-w-0 flex flex-row gap-1.5">
              <h1 className="text-2xl font-bold tracking-tight">{member.name}</h1>
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                <StatusBadge banned={member.isBanned} />
              </div>
            </div>
          </div>
          {canMembers && (
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <Link
                href={`/dashboard/manager/members/${member.id}/edit`}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-line bg-panel px-4 py-2.5 text-sm font-semibold text-accent-strong transition-colors hover:bg-accent/10"
              >
                <Pencil className="h-4 w-4" />
                تعديل البيانات
              </Link>
              {waLink && (
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-green-700"
                >
                  <MessageCircle className="h-4 w-4" />
                  إرسال بيانات الدخول
                </a>
              )}
            </div>
          )}
        </div>
      </header>

      {/* بيانات الدخول والاشتراك — لمن يدير المشتركين فقط */}
      {canMembers ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <InfoTile icon={User} label="اليوزر" value={member.loginCode ?? "—"} mono />
          <InfoTile icon={KeyRound} label="كلمة المرور" value={sub?.loginCode ?? "—"} mono />
          <InfoTile icon={Layers} label="الخدمة" value={sub?.serviceName ?? "—"} />
          <InfoTile icon={Phone} label="رقم الهاتف" value={member.phone} mono />
          <InfoTile icon={MapPin} label="المحافظة" value={member.governorate ?? "—"} />
          <InfoTile icon={CalendarDays} label="تاريخ الانضمام" value={formatDate(member.createdAt)} mono />
          <InfoTile
            icon={CalendarClock}
            label="تاريخ انتهاء الاشتراك"
            value={sub?.endDate ? formatDate(sub.endDate) : "—"}
            mono
          />
          <InfoTile icon={FileArchive} label="عدد الملفات" value={String(member.memberPrograms.length)} mono />
          <InfoTile
            icon={ShieldCheck}
            label="الحالة"
            value={member.isBanned ? "محظور" : "نشط"}
          />
        </div>
      ) : (
        // صلاحية المستحقات وحدها: بيانات أساسية فقط للسياق
        <div className="grid gap-3 sm:grid-cols-2">
          <InfoTile icon={Layers} label="الخدمة" value={sub?.serviceName ?? "—"} />
          <InfoTile icon={Phone} label="رقم الهاتف" value={member.phone} mono />
        </div>
      )}

      {/* مستحقات الدفع */}
      <section id="dues" className="scroll-mt-24 rounded-2xl border border-line bg-panel p-6 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 font-semibold">
            <Wallet className="h-5 w-5 text-accent-strong" />
            مستحقات الدفع
          </h2>
          <span
            className={`tabular rounded-full px-3 py-1 text-xs font-bold ${
              totalDue > 0
                ? "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300"
                : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
            }`}
            dir="ltr"
          >
            {totalDue > 0 ? `المتبقّي: ${formatPrice(totalDue)}` : "مدفوع بالكامل"}
          </span>
        </div>
        <MemberDues
          userId={member.id}
          subscription={
            sub
              ? {
                  id: sub.id,
                  title: sub.serviceName || "الاشتراك الأساسي",
                  amount: totalAmount,
                  paid: paidAmount,
                }
              : null
          }
          extras={member.extraCharges.map((c) => ({
            id: c.id,
            label: c.label,
            amount: Number(c.amount),
            paid: Number(c.paidAmount),
          }))}
        />
      </section>

      {/* رفع الملفات والملفات المرفوعة — لمن يدير المشتركين فقط */}
      {canMembers && (
        <>
      <section className="rounded-2xl border border-line bg-panel p-6 shadow-sm">
        <h2 className="mb-1 flex items-center gap-2 font-semibold">
          <FolderUp className="h-5 w-5 text-accent-strong" />
          رفع ملف الخدمة المطلوبة
        </h2>
        <p className="mb-4 text-sm text-muted">
          ارفع الخدمة كملف مضغوط — سيجده المشترك في صفحة حسابه الشخصية.
        </p>
        <MemberProgramForm userId={member.id} />
      </section>

      {/* الملفات المرفوعة */}
      <section>
        <h2 className="mb-3 font-semibold">
          الملفات المرفوعة{" "}
          <span className="tabular text-muted">({member.memberPrograms.length})</span>
        </h2>
        {member.memberPrograms.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-line p-8 text-center text-muted">
            لم تُرفع أي ملفات بعد.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {member.memberPrograms.map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-panel p-4 shadow-sm"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent-strong">
                    <FileArchive className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-medium">{p.title}</p>
                    <p className="text-xs text-muted">{formatDate(p.createdAt)}</p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <a
                    href={`/api/member-programs/${p.id}`}
                    download
                    aria-label="تنزيل"
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-line text-accent-strong transition-colors hover:bg-accent/10"
                  >
                    <Download className="h-4 w-4" />
                  </a>
                  <ConfirmDeleteForm
                    action={deleteMemberProgramAction}
                    fields={{ programId: p.id, userId: member.id }}
                    message={`حذف البرنامج «${p.title}»؟`}
                    description="يُحذف الملف نهائياً — لا يمكن التراجع."
                    successMessage="تم حذف البرنامج."
                  >
                    <button
                      type="submit"
                      aria-label="حذف"
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-red-500 transition-colors hover:bg-red-500/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </ConfirmDeleteForm>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
        </>
      )}
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
