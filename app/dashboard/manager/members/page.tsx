import Link from "next/link";
import { Ban, CheckCircle2, MessageCircle, UserPlus, FileText } from "lucide-react";
import { requirePermission } from "@/lib/auth/guards";
import { getSubscribers } from "@/server/queries/manager";
import { toggleBanAction } from "@/server/actions/manager";
import { buildWhatsAppLink, buildWelcomeMessage } from "@/lib/whatsapp";
import { SubscriberForm } from "@/components/dashboard/subscriber-form";
import { DeleteSubscriberButton } from "@/components/dashboard/delete-subscriber-button";
import { DataList, DataRow, DataCell } from "@/components/dashboard/data-list";

const COLS = "minmax(0,1.8fr) minmax(0,1.3fr) 0.9fr auto";

export const metadata = { title: "إدارة المشتركين | Orvion" };

export default async function MembersPage() {
  // المدير أو الأدمن صاحب صلاحية المشتركين
  await requirePermission("canManageMembers");
  const subscribers = await getSubscribers();

  return (
    <main className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">المشتركون</h1>
        <p className="mt-1.5 text-sm text-muted sm:text-base">
          أضف المشتركين وأرسل لهم بيانات الدخول عبر واتساب.
        </p>
      </div>

      <section className="rounded-2xl border border-line bg-panel p-6 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 font-semibold">
          <UserPlus className="h-5 w-5 text-accent-strong" />
          إضافة مشترك
        </h2>
        <SubscriberForm />
      </section>

      <section>
        <h2 className="mb-4 font-semibold">
          قائمة المشتركين <span className="tabular text-muted">({subscribers.length})</span>
        </h2>
        {subscribers.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-line p-10 text-center text-muted">
            لا يوجد مشتركون بعد.
          </p>
        ) : (
          <DataList cols={COLS} headers={["الاسم", "الخدمة", "الحالة", <span key="a" className="block text-end">إجراءات</span>]}>
            {subscribers.map((m) => {
              const sub = m.subscriptions[0];
              const waLink = sub
                ? buildWhatsAppLink(
                    m.phone,
                    buildWelcomeMessage({
                      name: m.name,
                      username: m.loginCode ?? m.phone,
                      password: sub.loginCode ?? "",
                      serviceName: sub.serviceName,
                    }),
                  )
                : null;
              return (
                <DataRow key={m.id} cols={COLS}>
                  {/* الاسم */}
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-accent/15 to-accent/5 text-xs font-bold text-accent-strong ring-1 ring-accent/10">
                      {m.name.charAt(0)}
                    </span>
                    <span className="truncate font-semibold">{m.name}</span>
                  </div>

                  {/* الخدمة */}
                  <DataCell label="الخدمة">
                    <span className="text-muted">{sub?.serviceName ?? "—"}</span>
                  </DataCell>

                  {/* الحالة */}
                  <DataCell label="الحالة">
                    {m.isBanned ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700 dark:bg-red-950/50 dark:text-red-300">
                        <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                        محظور
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        نشط
                      </span>
                    )}
                  </DataCell>

                  {/* إجراءات */}
                  <div className="flex flex-wrap items-center gap-2 border-t border-line pt-3 md:justify-end md:border-0 md:pt-0">
                    <Link
                      href={`/dashboard/manager/members/${m.id}`}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-2 text-sm font-medium text-accent-strong transition-all hover:scale-105 hover:border-accent/40 hover:bg-accent/10 active:scale-95"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      تفاصيل
                      {m._count.memberPrograms > 0 && (
                        <span className="tabular rounded-full bg-accent/15 px-1.5 text-[11px]">
                          {m._count.memberPrograms}
                        </span>
                      )}
                    </Link>
                    {waLink && (
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
                    )}
                    <form action={toggleBanAction}>
                      <input type="hidden" name="userId" value={m.id} />
                      <input type="hidden" name="ban" value={(!m.isBanned).toString()} />
                      <button
                        type="submit"
                        aria-label={m.isBanned ? "رفع الحظر" : "حظر"}
                        title={m.isBanned ? "رفع الحظر" : "حظر"}
                        className={`flex h-9 w-9 items-center justify-center rounded-lg transition-all hover:scale-110 hover:text-white hover:shadow-md active:scale-95 ${
                          m.isBanned
                            ? "bg-emerald-600/10 text-emerald-600 hover:bg-emerald-600 hover:shadow-emerald-600/30 dark:text-emerald-400"
                            : "bg-red-600/10 text-red-600 hover:bg-red-600 hover:shadow-red-600/30 dark:text-red-400"
                        }`}
                      >
                        {m.isBanned ? <CheckCircle2 className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                      </button>
                    </form>
                    <DeleteSubscriberButton userId={m.id} name={m.name} />
                  </div>
                </DataRow>
              );
            })}
          </DataList>
        )}
      </section>
    </main>
  );
}
