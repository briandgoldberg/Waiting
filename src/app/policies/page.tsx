import Link from "next/link";
import { prisma } from "@/lib/db";
import { serializeProject } from "@/lib/serialize";
import { CAUSE_CATEGORY_BY_SLUG } from "@/lib/data/causeCategories";
import { POLICIES } from "@/lib/data/policies";
import { formatCapacity } from "@/lib/data/taxonomies";

export const dynamic = "force-dynamic";

export default async function PoliciesPage() {
  const projectRows = await prisma.project.findMany({
    include: { causes: true, sources: true, milestones: true },
    orderBy: { createdAt: "asc" },
  });
  const projects = projectRows.map(serializeProject).filter((p) => !p.isAggregateExample);

  return (
    <div className="mx-auto max-w-3xl w-full px-4 sm:px-6 py-6 flex flex-col gap-8">
      <div>
        <Link href="/" className="text-sm text-[var(--muted)] hover:underline">
          ← Back to map &amp; list
        </Link>
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Policies to support</h1>
        <p className="text-base text-[var(--muted)] mt-2 max-w-2xl">
          Six specific, bipartisan reform proposals — one for each structural bottleneck the data
          on this site tracks. None of these is presented as a silver bullet: each has real
          trade-offs, laid out below alongside the case for it.
        </p>
        <p className="text-xs text-[var(--muted)] mt-3 max-w-2xl">
          Arguments here are informed by permitting-reform positions publicly advocated by{" "}
          <a
            href="https://citizensclimatelobby.org/"
            target="_blank"
            rel="noreferrer"
            className="underline"
          >
            Citizens&rsquo; Climate Lobby
          </a>{" "}
          and other bipartisan reform groups, rewritten in this site&rsquo;s own words and framed
          with weaknesses included, not just the case for. Bill links point to Congress.gov topic
          searches rather than pinned bill numbers where a specific bill wasn&rsquo;t confirmed
          still pending — legislation is reintroduced under a new number every two-year Congress,
          so a search stays current where a fixed citation would go stale.
        </p>
      </div>

      <nav className="flex flex-wrap gap-1.5">
        {POLICIES.map((policy) => {
          const cause = CAUSE_CATEGORY_BY_SLUG[policy.slug];
          return (
            <a
              key={policy.slug}
              href={`#${policy.slug}`}
              className="px-2.5 py-1 rounded-full text-xs border border-[var(--border)] hover:opacity-80"
            >
              <span
                className="inline-block h-2 w-2 rounded-full mr-1.5 align-middle"
                style={{ backgroundColor: cause.color }}
              />
              {cause.shortLabel}
            </a>
          );
        })}
      </nav>

      <div className="flex flex-col gap-10">
        {POLICIES.map((policy) => {
          const cause = CAUSE_CATEGORY_BY_SLUG[policy.slug];
          const relatedProjects = projects.filter((p) => p.causeSlugs.includes(policy.slug));
          const totalMw = relatedProjects.reduce(
            (sum, p) => (p.capacityUnit === "MW" && p.capacityValue != null ? sum + p.capacityValue : sum),
            0,
          );

          return (
            <section
              key={policy.slug}
              id={policy.slug}
              className="rounded-xl border border-[var(--border)] bg-[var(--panel)] overflow-hidden scroll-mt-20"
            >
              <div className="h-1.5" style={{ backgroundColor: cause.color }} />
              <div className="p-5 sm:p-6 flex flex-col gap-5">
                <div>
                  <span
                    className="inline-block text-xs font-medium uppercase tracking-wide rounded-full px-2.5 py-1 text-white mb-2"
                    style={{ backgroundColor: cause.color }}
                  >
                    {cause.shortLabel}
                  </span>
                  <h2 className="text-2xl font-bold tracking-tight">{policy.title}</h2>
                  <p className="text-sm text-[var(--muted)] mt-1">{policy.oneLiner}</p>
                </div>

                <div>
                  <h3 className="text-sm uppercase tracking-wide text-[var(--muted)] mb-1.5">
                    The problem
                  </h3>
                  <p className="text-sm leading-relaxed">{policy.problem}</p>
                </div>

                <div>
                  <h3 className="text-sm uppercase tracking-wide text-[var(--muted)] mb-1.5">
                    The proposal
                  </h3>
                  <p className="text-sm leading-relaxed">{policy.proposal}</p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/40 p-4">
                    <h3 className="text-sm font-semibold text-green-800 dark:text-green-400 mb-2">
                      Strengths
                    </h3>
                    <ul className="text-sm flex flex-col gap-2">
                      {policy.strengths.map((s, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="text-green-600 dark:text-green-500 flex-shrink-0">+</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 p-4">
                    <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-500 mb-2">
                      Weaknesses
                    </h3>
                    <ul className="text-sm flex flex-col gap-2">
                      {policy.weaknesses.map((w, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="text-amber-600 dark:text-amber-500 flex-shrink-0">−</span>
                          <span>{w}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm uppercase tracking-wide text-[var(--muted)] mb-1.5">
                    Bills on this topic
                  </h3>
                  <ul className="text-sm flex flex-col gap-1.5">
                    {policy.bills.map((bill) => (
                      <li key={bill.url}>
                        <a
                          href={bill.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[var(--accent)] underline font-medium"
                        >
                          {bill.label}
                        </a>
                        {bill.note && (
                          <span className="text-xs text-[var(--muted)]"> — {bill.note}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border-t border-[var(--border)] pt-4">
                  <h3 className="text-sm uppercase tracking-wide text-[var(--muted)] mb-2">
                    Currently in the data
                  </h3>
                  {relatedProjects.length > 0 ? (
                    <>
                      <p className="text-sm mb-3">
                        <strong>{relatedProjects.length}</strong> project
                        {relatedProjects.length === 1 ? "" : "s"} currently tracked under this
                        cause, representing <strong>{Math.round(totalMw).toLocaleString("en-US")} MW</strong>{" "}
                        across fuel types.
                      </p>
                      <ul className="flex flex-col gap-2">
                        {relatedProjects.map((p) => (
                          <li
                            key={p.id}
                            className="flex items-center justify-between gap-2 text-sm border-t border-[var(--border)] pt-2 first:border-t-0 first:pt-0"
                          >
                            <Link href={`/project/${p.slug}`} className="hover:underline font-medium">
                              {p.name}
                            </Link>
                            <span className="text-[var(--muted)] text-xs whitespace-nowrap">
                              {formatCapacity(p.capacityValue, p.capacityUnit)}
                              {p.yearsWaiting != null ? ` · ${p.yearsWaiting.toFixed(1)} yrs` : ""}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : (
                    <p className="text-sm text-[var(--muted)]">
                      No projects currently tagged with this cause.
                    </p>
                  )}
                </div>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
