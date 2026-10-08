import { redirect } from "next/navigation";

// الطلبات صارت تُعرض ضمن صفحة الحساب (البروفايل).
export default function OrdersPage() {
  redirect("/profile");
}
