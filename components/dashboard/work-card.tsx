// بطاقة عمل للعرض — التعديل يفتح صفحة مستقلّة للعنصر، مع حذف سريع.
import Image from "next/image";
import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { deleteWorkAction } from "@/server/actions/admin-content";
import { ConfirmDeleteForm } from "./confirm-delete-form";

export type WorkCardData = {
  id: number;
  title: string;
  description: string | null;
  imageUrl: string | null;
};

export function WorkCard({ work }: { work: WorkCardData }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-panel shadow-sm transition-all hover:border-accent/30 hover:shadow-md">
      {/* الصورة — نسبة أبعاد ثابتة تضمن تناسق كل الكروت */}
      <Link
        href={`/dashboard/content/works/${work.id}`}
        className="relative block aspect-16/10 shrink-0 overflow-hidden bg-foreground/5"
      >
        {work.imageUrl ? (
          <Image
            src={work.imageUrl}
            alt={work.title}
            fill
            sizes="(min-width: 768px) 33vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl font-black text-accent/25">
            {work.title.charAt(0)}
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-1 font-semibold">{work.title}</h3>
        <p className="mt-1 line-clamp-2 flex-1 text-sm text-muted">
          {work.description || "بلا وصف."}
        </p>
        <div className="mt-4 flex items-center gap-2 border-t border-line pt-3">
          <Link
            href={`/dashboard/content/works/${work.id}`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-sm font-medium text-accent-strong transition-all hover:border-accent/40 hover:bg-accent/10 active:scale-95"
          >
            <Pencil className="h-3.5 w-3.5" />
            تعديل
          </Link>
          <ConfirmDeleteForm
            action={deleteWorkAction}
            fields={{ workId: work.id }}
            message={`حذف العمل «${work.title}»؟`}
            successMessage="تم حذف العمل."
            className="ms-auto"
          >
            <button
              type="submit"
              aria-label="حذف"
              title="حذف"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-line text-red-500 transition-all hover:border-red-500/40 hover:bg-red-500/10 active:scale-95"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </ConfirmDeleteForm>
        </div>
      </div>
    </article>
  );
}
