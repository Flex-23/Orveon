import { ServicesSection } from "@/components/home/services-section";
import { getServiceCards } from "@/server/queries/content";

export const metadata = { title: "الخدمات | Orvion" };

// تمنع توليد الصفحة مسبقاً أثناء البناء حتى لا تُستدعى قاعدة البيانات وقت npm run build.
export const dynamic = "force-dynamic";

export default async function ServicesPage() {
  const services = await getServiceCards();

  return (
    <main className="flex-1 py-8">
      <ServicesSection services={services} />
    </main>
  );
}
