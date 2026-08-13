import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { serializeProject } from "@/lib/serialize";
import { CAUSE_CATEGORIES, getCauseCategory } from "@/lib/data/causeCategories";
import { formatCapacity } from "@/lib/data/taxonomies";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return CAUSE_CATEGORIES.map((c) => ({ slug: c.slug }));
}

export default async function ReformExplainerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cause = getCauseCategory(slug);
  if (!cause) notFound();

  const projectRows = await prisma.project.findMany({
    where: { causes: { some: { causeSlug: slug } } },
    include: { causes: true, sources: true, milestones: true },
    orderBy: { createdAt: "asc" },
  });
  const projects = projectRows.map(serializeProject);
  const realProjects = projects.filter((p) => !p.isAggregateExample);
  const totalMw = realProjects.reduce(
    (sum, p) => (p.capacityUnit === "MW" && p.capacityValue != null ? sum + p.capacityValue : sum),
    0,
  );

  return (
    <div className="mx-auto max-w-4xl w-full px-4 sm:px-6 py-6 flex flex-col gap-6">
      <div>
        <Link href="/" className="text-sm text-[var(--muted)] hover:underline">
          ← Back to map &amp; list
        </Link>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {CAUSE_CATEGORIES.map((c) => (
          <Link
            key={c.slug}
            href={`/reform/${c.slug}`}
            className={`px-2.5 py-1 rounded-full text-xs border ${
              c.slug === slug ? "text-white border-transparent" : "border-[var(--border)]"
            }`}
            style={c.slug === slug ? { backgroundColor: c.color } : undefined}
          >
            {c.shortLabel}
          </Link>
        ))}
      </div>

      <div>
        <span
          className="inline-block h-3 w-3 rounded-full mb-2"
          style={{ backgroundColor: cause.color }}
        />
        <h1 className="text-3xl font-bold tracking-tight">{cause.label}</h1>
        {cause.isControlGroup && (
          <p className="text-xs mt-2 inline-block rounded-full bg-gray-200 dark:bg-gray-800 px-2.5 py-1">
            Control group — not part of the reform argument
          </p>
        )}
      </div>

      <section className="rounded-lg border border-[var(--border)] bg-[var(--panel)] p-5">
        <h2 className="text-sm uppercase tracking-wide text-[var(--muted)] mb-2">The bottleneck</h2>
        <p className="text-base">{cause.description}</p>
      </section>

      <section className="rounded-lg border border-[var(--border)] bg-[var(--panel)] p-5">
        <h2 className="text-sm uppercase tracking-wide text-[var(--muted)] mb-2">
          {cause.isControlGroup ? "Why this is tracked separately" : `The reform: ${cause.reformLever}`}
        </h2>
        <p className="text-base">{cause.reformDescription}</p>
      </section>

      <section className="rounded-lg border border-[var(--border)] bg-[var(--panel)] p-5">
        <h2 className="text-sm uppercase tracking-wide text-[var(--muted)] mb-3">
          Currently in the data
        </h2>
        <p className="text-base mb-4">
          <strong>{realProjects.length}</strong> project{realProjects.length === 1 ? "" : "s"} currently
          tracked under this category, representing{" "}
          <strong>{Math.round(totalMw).toLocaleString("en-US")} MW</strong> across fuel types.
        </p>
        <ul className="flex flex-col gap-2">
          {projects.map((p) => (
            <li key={p.id} className="flex items-center justify-between gap-2 text-sm border-t border-[var(--border)] pt-2 first:border-t-0 first:pt-0">
              <Link href={`/project/${p.slug}`} className="hover:underline font-medium">
                {p.name}
              </Link>
              <span className="text-[var(--muted)] text-xs whitespace-nowrap">
                {formatCapacity(p.capacityValue, p.capacityUnit)}
                {p.yearsWaiting != null ? ` · ${p.yearsWaiting.toFixed(1)} yrs` : ""}
              </span>
            </li>
          ))}
          {projects.length === 0 && (
            <li className="text-sm text-[var(--muted)]">No projects currently tagged with this cause.</li>
          )}
        </ul>
      </section>
    </div>
  );
}
