import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { requirePermission } from "@/lib/auth/guards";
import { getSubscriberById } from "@/server/queries/manager";
import { toDateInputValue } from "@/lib/format";
import { SubscriberEditForm } from "@/components/dashboard/subscriber-edit-form";

export const metadata = { title: "تعديل المشترك | Orvion" };

export default async function MemberEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePermission("canManageMembers");
  const { id } = await params;
  const member = await getSubscriberById(Number(id));
  if (!member) notFound();

  const sub = member.subscriptions[0];

  return (
    <main className="mx-auto max-w-3xl space-y-6">
      <Link
        href={`/dashboard/manager/members/${member.id}`}
        className="inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-accent-strong"
      >
        <ArrowRight className="h-4 w-4" />
        رجوع إلى تفاصيل المشترك
      </Link>

      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">تعديل المشترك</h1>
        <p className="mt-1.5 text-muted">
          عدّل بيانات «{member.name}» وخدمته وتاريخ انتهاء اشتراكه.
        </p>
      </div>

      <SubscriberEditForm
        subscriber={{
          id: member.id,
          name: member.name,
          phone: member.phone,
          governorate: member.governorate,
          serviceName: sub?.serviceName ?? "",
          endDate: toDateInputValue(sub?.endDate),
          totalAmount: Number(sub?.totalAmount ?? 0),
          paidAmount: Number(sub?.paidAmount ?? 0),
        }}
      />
    </main>
  );
}
