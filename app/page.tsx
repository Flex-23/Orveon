import { HeroSection } from "@/components/home/hero-section";
import { StatsBand } from "@/components/home/stats-band";
import { WorksSection } from "@/components/home/works-section";
import { ProcessSection } from "@/components/home/process-section";
import { ServicesSection } from "@/components/home/services-section";
import { StoreCta } from "@/components/home/store-cta";
import { ProjectRequestsStatus } from "@/components/home/project-requests-status";
import { getPublicWorks, getServiceCards } from "@/server/queries/content";
import { getUserProjectRequests } from "@/server/queries/projects";
import { getCurrentUser } from "@/lib/auth/session";

// الصفحة دايناميكية أصلاً (جلسة المستخدم) — التصريح يمنع Next من محاولة توليدها
// مسبقاً أثناء البناء، فلا تُستدعى قاعدة البيانات وقت npm run build إطلاقاً.
export const dynamic = "force-dynamic";

export default async function Home() {
  const [works, services, user] = await Promise.all([
    getPublicWorks(),
    getServiceCards(),
    getCurrentUser(),
  ]);

  const trialUser = user
    ? { name: user.name, phone: user.phone, governorate: user.governorate }
    : null;

  // طلبات المشاريع الخاصة بالزبون — لعرض حالتها له تحت البطل مباشرة.
  const projectRequests = user ? await getUserProjectRequests(user.id) : [];

  return (
    <main>
      {/* 1) البطل */}
      <HeroSection />
      {/* حالة طلبات «ابدأ مشروعك» للزبون المسجّل (تظهر فقط عند وجود طلبات) */}
      <ProjectRequestsStatus requests={projectRequests} />
      {/* 2) شريط الإحصاءات — مؤشّرات ثقة تحت البطل */}
      <StatsBand />
      {/* 3) الأعمال — برهان الجودة (كروت BorderGlow) */}
      <WorksSection works={works} user={trialUser} />
      {/* 4) كيف نعمل — منهجية العمل */}
      <ProcessSection />
      {/* 5) الخدمات — ما نبنيه لك */}
      <ServicesSection services={services} />
      {/* 6) زر الانتقال إلى المتجر قبل الفوتر */}
      <StoreCta />
      {/* الفوتر — مُضاف عالمياً في layout */}
    </main>
  );
}
