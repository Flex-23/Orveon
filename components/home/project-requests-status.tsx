// شريط حالة طلبات المشاريع للزبون المسجّل — يظهر تحت البطل في الصفحة الرئيسية
// فقط عندما يملك الزبون طلبات، ويعرض حالة كل طلب كما حدّدتها الإدارة.
import { Rocket } from "lucide-react";
import { formatDate } from "@/lib/format";
import {
  PROJECT_STATUS_LABELS,
  PROJECT_STATUS_BADGE,
  PROJECT_STATUS_DOT,
} from "@/lib/order-labels";
import type { ProjectRequest } from "@/lib/generated/prisma";

export function ProjectRequestsStatus({ requests }: { requests: ProjectRequest[] }) {
  if (requests.length === 0) return null;

  return (
    <section aria-label="حالة طلبات مشاريعك" className="border-b border-border/70">
      <div className="mx-auto w-full max-w-7xl px-6 py-8">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-muted">
          <Rocket className="h-4 w-4 text-accent-strong" />
          طلبات مشاريعك
        </h2>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {requests.map((r) => (
            <li
              key={r.id}
              className="rounded-2xl border border-border bg-surface-2/40 p-4 backdrop-blur"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold">طلب مشروع #{r.id}</span>
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${PROJECT_STATUS_BADGE[r.status]}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${PROJECT_STATUS_DOT[r.status]}`} />
                  {PROJECT_STATUS_LABELS[r.status]}
                </span>
              </div>
              <p className="mt-2 line-clamp-2 text-sm text-muted">{r.description}</p>
              <p className="mt-2 text-xs text-muted/80">
                {r.duration} · {formatDate(r.createdAt)}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
