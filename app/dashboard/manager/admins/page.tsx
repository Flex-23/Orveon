import { UserPlus } from "lucide-react";
import { requireManager } from "@/lib/auth/guards";
import { getAdmins } from "@/server/queries/manager";
import { decryptCredential } from "@/lib/auth/credential-crypto";
import { PERMISSION_LABELS, type Permission } from "@/lib/auth/permissions";
import { AdminForm } from "@/components/dashboard/admin-form";
import { AdminCard } from "@/components/dashboard/admin-card";

export const metadata = { title: "إدارة الأدمن | Orvion" };

const PERMS = Object.keys(PERMISSION_LABELS) as Permission[];

export default async function AdminsPage() {
  await requireManager(); // إدارة الأدمن للمدير فقط (الواجهة لم تعد محصورة بالـ layout)
  const admins = await getAdmins();

  return (
    <main className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">الأدمن</h1>
        <p className="mt-1.5 text-muted">أنشئ حسابات الأدمن وعدّل صلاحياتها.</p>
      </div>

      <section className="rounded-2xl border border-line bg-panel p-6 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 font-semibold">
          <UserPlus className="h-5 w-5 text-accent-strong" />
          إضافة أدمن وتحديد صلاحياته
        </h2>
        <AdminForm />
      </section>

      <section>
        <h2 className="mb-4 font-semibold">
          قائمة الأدمن <span className="tabular text-muted">({admins.length})</span>
        </h2>
        {admins.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-line p-8 text-center text-muted">
            لا يوجد أدمن بعد.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {admins.map((a) => {
              const permissions = Object.fromEntries(
                PERMS.map((k) => [k, Boolean(a.permissions?.[k])]),
              ) as Record<Permission, boolean>;
              return (
                <AdminCard
                  key={a.id}
                  admin={{
                    id: a.id,
                    name: a.name,
                    phone: a.phone,
                    isBanned: a.isBanned,
                    password: decryptCredential(a.passwordEnc),
                    permissions,
                  }}
                />
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
