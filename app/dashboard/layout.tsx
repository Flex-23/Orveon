// حارس عام للوحات التحكم: أدمن/مدير فقط.
import { requireStaff } from "@/lib/auth/guards";

// لوحات التحكم محمية بجلسة ولا تُولَّد مسبقاً أبداً — التصريح يمنع Next من
// محاولة توليدها أثناء البناء (كانت المحاولة تستدعي قاعدة البيانات بلا داع).
export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireStaff();
  return <div className="flex-1 bg-dash">{children}</div>;
}
