import Link from "next/link";
import { ASSUMED_WHOLESALE_PRICE_USD_PER_MWH, CAPACITY_FACTOR_BY_FUEL } from "@/lib/calc/costOfDelay";
import { FUEL_TYPE_BY_VALUE } from "@/lib/data/taxonomies";

export default function MethodologyPage() {
  return (
    <div className="mx-auto max-w-3xl w-full px-4 sm:px-6 py-6 flex flex-col gap-6">
      <div>
        <Link href="/" className="text-sm text-[var(--muted)] hover:underline">
          ← Back to map &amp; list
        </Link>
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Methodology</h1>
        <p className="text-sm text-[var(--muted)] mt-1">
          How the numbers on this site are computed, what they assume, and where they&rsquo;re
          deliberately incomplete.
        </p>
      </div>

      <section className="rounded-lg border border-[var(--border)] bg-[var(--panel)] p-5">
        <h2 className="text-lg font-semibold mb-2">Days / years waiting</h2>
        <p className="text-sm">
          <code>today − application/interconnection-request filed date</code>, computed live on
          every page load (not cached), so it&rsquo;s always current. Where a source didn&rsquo;t
          publish an exact filing date, the project is marked{" "}
          <code>dateConfidence: approximate</code> and the underlying date is our best reading of
          public reporting — see each project&rsquo;s &ldquo;data quality note.&rdquo;
        </p>
      </section>

      <section className="rounded-lg border border-[var(--border)] bg-[var(--panel)] p-5">
        <h2 className="text-lg font-semibold mb-2">Cost of delay</h2>
        <p className="text-sm mb-3">
          For generation and storage projects with capacity measured in MW and a fuel type with a
          published typical capacity factor:
        </p>
        <pre className="text-xs bg-black/5 dark:bg-white/10 rounded-md p-3 overflow-x-auto">
{`estimated value of undelivered energy
  = capacity (MW)
  × typical capacity factor for that fuel/technology
  × 24 (hours/day)
  × days waiting
  × assumed wholesale price ($${ASSUMED_WHOLESALE_PRICE_USD_PER_MWH}/MWh)`}
        </pre>
        <p className="text-sm mt-3">
          This approximates the market value of the electricity a project would have generated
          and sold, had it been online for the delay period, at a single blended national
          wholesale price. It is an order-of-magnitude proxy for &ldquo;value left on the
          table,&rdquo; not a project-specific revenue forecast — real capacity factors, prices,
          and curtailment vary a lot by location, season, and hour.
        </p>
        <h3 className="text-sm font-semibold mt-4 mb-2">Capacity factors used</h3>
        <ul className="text-sm grid grid-cols-2 gap-1">
          {Object.entries(CAPACITY_FACTOR_BY_FUEL).map(([fuel, cf]) => (
            <li key={fuel}>
              {FUEL_TYPE_BY_VALUE[fuel as keyof typeof FUEL_TYPE_BY_VALUE]?.label ?? fuel}:{" "}
              <strong>{(cf * 100).toFixed(0)}%</strong>
            </li>
          ))}
        </ul>
        <h3 className="text-sm font-semibold mt-4 mb-2">What&rsquo;s NOT estimated, and why</h3>
        <p className="text-sm">
          Transmission, pipeline, and LNG projects are not run through this formula — &ldquo;MW of
          undelivered generation&rdquo; isn&rsquo;t the right unit for a wire or a pipe. We
          considered a congestion-cost proxy for transmission and a throughput-value proxy for
          pipelines/LNG, but didn&rsquo;t have assumptions we could defend to the same standard as
          the generation formula above, so those projects show &ldquo;not estimated&rdquo; rather
          than a number we couldn&rsquo;t back up. Storage is excluded for the same reason — its
          economic value is about avoided peaker capacity and arbitrage, not a
          capacity-factor-weighted energy value.
        </p>
      </section>

      <section className="rounded-lg border border-[var(--border)] bg-[var(--panel)] p-5">
        <h2 className="text-lg font-semibold mb-2">Aggregate headline stats</h2>
        <p className="text-sm">
          Total capacity, total project-years, and total cost of delay sum only over projects in
          the <em>current filtered set</em> — they update live as you filter. Entries flagged{" "}
          <code>isAggregateExample</code> (currently: the PJM regional interconnection-queue
          entry) are always excluded from these totals, since they represent a regional statistic
          rather than one physical project and would double-count against individual projects
          also shown.
        </p>
      </section>

      <section className="rounded-lg border border-[var(--border)] bg-[var(--panel)] p-5">
        <h2 className="text-lg font-semibold mb-2">Data &amp; sourcing</h2>
        <p className="text-sm">
          v1&rsquo;s seed data is a small, hand-researched set of real, individually-cited projects —
          not a live pull from the automated ingestion pipeline (see{" "}
          <code>src/lib/ingest/</code> in the repo), which needs API keys and a downloaded LBNL
          workbook this environment didn&rsquo;t have. Every seeded project links to the public
          reporting or primary source it was checked against. See the repo&rsquo;s README for the full
          list of open questions — including cross-source project identity matching and data
          source terms of use — flagged rather than silently guessed at.
        </p>
      </section>
    </div>
  );
}
