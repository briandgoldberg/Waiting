import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { serializeProject } from "@/lib/serialize";
import { CauseBadge } from "@/components/CauseBadge";
import { getCauseCategory } from "@/lib/data/causeCategories";
import { FUEL_TYPE_BY_VALUE, formatCapacity } from "@/lib/data/taxonomies";
import { formatUsd } from "@/lib/calc/costOfDelay";
import { formatTonnesCo2 } from "@/lib/calc/co2Avoided";

export const dynamic = "force-dynamic";

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await prisma.project.findUnique({
    where: { slug: id },
    include: { causes: true, sources: true, milestones: true },
  });

  if (!project) notFound();

  const p = serializeProject(project);
  const fuel = FUEL_TYPE_BY_VALUE[p.fuelType];

  return (
    <div className="mx-auto max-w-4xl w-full px-4 sm:px-6 py-6 flex flex-col gap-6">
      <div>
        <Link href="/" className="text-sm text-[var(--muted)] hover:underline">
          ← Back to map &amp; list
        </Link>
      </div>

      {p.isAggregateExample && (
        <div className="rounded-lg border border-amber-400/50 bg-amber-50 dark:bg-amber-950/30 px-4 py-3 text-sm">
          <strong>This is a regional aggregate, not a single physical project.</strong> It&rsquo;s
          included to illustrate the interconnection-queue-backlog category with real, cited
          numbers and is excluded from this site&rsquo;s aggregate headline stats. See
          &ldquo;Data quality notes&rdquo; below.
        </div>
      )}

      <div>
        <div className="flex items-center gap-2 flex-wrap mb-2">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: fuel?.color ?? "#6b7280" }}
          />
          <span className="text-xs uppercase tracking-wide text-[var(--muted)]">
            {p.projectType} · {fuel?.label ?? p.fuelType}
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">{p.name}</h1>
        <p className="text-sm text-[var(--muted)] mt-1">
          {[p.county, p.state].filter(Boolean).join(", ") || "Location not specified"}
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat label="Capacity" value={formatCapacity(p.capacityValue, p.capacityUnit)} />
        <Stat label="Waiting" value={p.yearsWaiting != null ? `${p.yearsWaiting.toFixed(1)} yrs` : "—"} />
        <Stat label="Stage" value={p.currentStage.replace(/_/g, " ")} />
        <Stat
          label="Verification"
          value={p.verificationStatus.replace(/_/g, " ")}
        />
      </div>

      <section className="rounded-lg border border-[var(--border)] bg-[var(--panel)] p-5">
        <h2 className="text-lg font-semibold mb-3">Why it&rsquo;s waiting</h2>
        {p.causeSlugs.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">
            Cause category not yet determined for this project — see data quality notes below.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {p.causeSlugs.map((slug) => {
              const cause = getCauseCategory(slug);
              if (!cause) return null;
              return (
                <div key={slug} className="border-l-4 pl-4" style={{ borderColor: cause.color }}>
                  <div className="flex items-center gap-2 mb-1">
                    <CauseBadge slug={slug} />
                  </div>
                  <p className="text-sm">{cause.description}</p>
                </div>
              );
            })}
          </div>
        )}
        <p className="text-sm mt-4 border-t border-[var(--border)] pt-4">{p.causeDetail}</p>
        {p.causeSlugs.length > 0 && (
          <Link
            href="/policies"
            className="text-sm font-medium text-[var(--accent)] underline mt-4 inline-block"
          >
            See the policies that would fix this →
          </Link>
        )}
      </section>

      <section className="rounded-lg border border-[var(--border)] bg-[var(--panel)] p-5">
        <h2 className="text-lg font-semibold mb-3">Estimated energy bill impact</h2>
        {p.costOfDelay.applicable ? (
          <>
            <div className="text-3xl font-bold tabular-nums">{formatUsd(p.costOfDelay.estimatedUsd!)}</div>
            <p className="text-xs text-[var(--muted)] mt-2">
              ≈ {Math.round(p.costOfDelay.estimatedMwhUndelivered ?? 0).toLocaleString("en-US")} MWh of
              undelivered energy, using a {(p.costOfDelay.capacityFactor! * 100).toFixed(0)}% typical
              capacity factor and a $35/MWh assumed wholesale price — a proxy for the downward
              pressure on electricity costs this project's power would have provided, not a
              literal bill-line total.{" "}
              <Link href="/methodology" className="underline">
                Full methodology
              </Link>
              .
            </p>
          </>
        ) : (
          <p className="text-sm text-[var(--muted)]">Not estimated: {p.costOfDelay.reason}</p>
        )}
      </section>

      <section className="rounded-lg border border-[var(--border)] bg-[var(--panel)] p-5">
        <h2 className="text-lg font-semibold mb-3">CO2 avoided if online</h2>
        {p.co2Avoided.applicable ? (
          <>
            <div className="text-3xl font-bold tabular-nums">
              {formatTonnesCo2(p.co2Avoided.estimatedTonnesCo2Avoided!)}
            </div>
            <p className="text-xs text-[var(--muted)] mt-2">
              ≈ {Math.round(p.co2Avoided.estimatedMwhDelayed ?? 0).toLocaleString("en-US")} MWh of
              zero-carbon generation delayed, using a{" "}
              {(p.co2Avoided.capacityFactor! * 100).toFixed(0)}% typical capacity factor and the
              U.S. national average grid emissions rate (~0.81 lb CO2/kWh, EIA).{" "}
              <Link href="/methodology" className="underline">
                Full methodology
              </Link>
              .
            </p>
          </>
        ) : (
          <p className="text-sm text-[var(--muted)]">Not estimated: {p.co2Avoided.reason}</p>
        )}
      </section>

      <section className="rounded-lg border border-[var(--border)] bg-[var(--panel)] p-5">
        <h2 className="text-lg font-semibold mb-4">Timeline</h2>
        {p.milestones.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">No milestone history recorded yet.</p>
        ) : (
          <ol className="relative border-l border-[var(--border)] ml-2 flex flex-col gap-5">
            {p.milestones.map((m, i) => (
              <li key={i} className="ml-4">
                <span className="absolute -translate-x-[7px] mt-1 h-3 w-3 rounded-full bg-[var(--accent)]" />
                <div className="text-xs text-[var(--muted)]">
                  {new Date(m.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    timeZone: "UTC",
                  })}
                  {m.dateConfidence === "approximate" && " (approx.)"}
                  {" · "}
                  <span className="uppercase tracking-wide">{m.stage.replace(/_/g, " ")}</span>
                </div>
                <div className="text-sm mt-0.5">{m.description}</div>
              </li>
            ))}
          </ol>
        )}
      </section>

      {(p.lat != null && p.lon != null) && (
        <section className="rounded-lg border border-[var(--border)] bg-[var(--panel)] p-5">
          <h2 className="text-lg font-semibold mb-2">Location</h2>
          <p className="text-sm text-[var(--muted)]">
            {p.lat.toFixed(4)}, {p.lon.toFixed(4)} — see the{" "}
            <Link href="/" className="underline">
              map
            </Link>{" "}
            for this project in context with others.
          </p>
        </section>
      )}

      <section className="rounded-lg border border-[var(--border)] bg-[var(--panel)] p-5">
        <h2 className="text-lg font-semibold mb-3">Sources</h2>
        <ul className="flex flex-col gap-1.5 text-sm">
          {p.sources.map((s) => (
            <li key={s.url}>
              <a href={s.url} target="_blank" rel="noreferrer" className="text-[var(--accent)] underline">
                {s.label}
              </a>
            </li>
          ))}
        </ul>
        {p.dataQualityNote && (
          <div className="mt-4 pt-4 border-t border-[var(--border)] text-xs text-[var(--muted)]">
            <strong>Data quality note:</strong> {p.dataQualityNote}
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--panel)] p-3">
      <div className="text-base font-semibold capitalize">{value}</div>
      <div className="text-xs text-[var(--muted)] mt-0.5">{label}</div>
    </div>
  );
}
