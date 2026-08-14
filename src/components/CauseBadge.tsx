import Link from "next/link";
import { getCauseCategory, type CauseSlug } from "@/lib/data/causeCategories";

export function CauseBadge({ slug, linked = true }: { slug: CauseSlug; linked?: boolean }) {
  const cause = getCauseCategory(slug);
  if (!cause) return null;

  const content = (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium text-white"
      style={{ backgroundColor: cause.color }}
    >
      {cause.shortLabel}
    </span>
  );

  if (!linked) return content;

  return (
    <Link href={`/policies#${slug}`} className="hover:opacity-85">
      {content}
    </Link>
  );
}
