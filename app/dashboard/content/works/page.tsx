import { Plus } from "lucide-react";
import { getWorks } from "@/server/queries/content";
import { WorkForm } from "@/components/dashboard/work-form";
import { WorkCard } from "@/components/dashboard/work-card";

export const metadata = { title: "إدارة الأعمال | Orvion" };

export default async function WorksAdminPage() {
  const works = await getWorks();

  return (
    <main className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">الأعمال</h1>
        <p className="mt-1.5 text-muted">أضف أعمالك وعدّلها كما تظهر في الصفحة الرئيسية.</p>
      </div>

      <section className="rounded-2xl border border-line bg-panel p-6 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 font-semibold">
          <Plus className="h-5 w-5 text-accent-strong" />
          إضافة عمل
        </h2>
        <WorkForm />
      </section>

      <section>
        <h2 className="mb-4 font-semibold">
          الأعمال <span className="tabular text-muted">({works.length})</span>
        </h2>
        {works.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-line p-8 text-center text-muted">
            لا توجد أعمال بعد.
          </p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {works.map((w) => (
              <WorkCard
                key={w.id}
                work={{
                  id: w.id,
                  title: w.title,
                  description: w.description,
                  imageUrl: w.imageUrl,
                }}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
