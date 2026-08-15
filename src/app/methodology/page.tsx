import { CAPITAL_COST_USD_PER_KW } from "@/lib/calc/investmentWaiting";
import { FUEL_TYPE_BY_VALUE, ZERO_CARBON_FUELS } from "@/lib/data/taxonomies";

export default function MethodologyPage() {
  return (
    <div className="mx-auto max-w-3xl w-full px-4 sm:px-6 py-6 flex flex-col gap-6">
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
        <h2 className="text-lg font-semibold mb-2">Estimated investment waiting</h2>
        <p className="text-sm mb-3">
          For generation and storage projects with capacity measured in MW and a fuel type with a
          published typical construction cost:
        </p>
        <pre className="text-xs bg-black/5 dark:bg-white/10 rounded-md p-3 overflow-x-auto">
{`estimated investment waiting
  = capacity (MW) × 1,000 (kW/MW)
  × typical overnight construction cost for that technology ($/kW)`}
        </pre>
        <p className="text-sm mt-3">
          This is the estimated dollar value of the power plant itself — the capital investment
          an entrepreneur is ready to put into the ground — sitting in permitting or
          interconnection limbo. It needs only a project&rsquo;s capacity and technology, not a
          filing date, so (unlike an energy-market or bill-savings estimate) it&rsquo;s computable
          for nearly every generation/storage project in the dataset, not just the ones with a
          published application date. It is a construction-cost estimate, not a revenue forecast
          or a bill estimate, and real project costs vary by site, size, and year — this uses a
          single national-average figure per technology, not inflation-adjusted from its source
          year.
        </p>
        <h3 className="text-sm font-semibold mt-4 mb-2">Construction costs used (2021$/kW)</h3>
        <ul className="text-sm grid grid-cols-2 gap-1">
          {Object.entries(CAPITAL_COST_USD_PER_KW).map(([fuel, cost]) => (
            <li key={fuel}>
              {FUEL_TYPE_BY_VALUE[fuel as keyof typeof FUEL_TYPE_BY_VALUE]?.label ?? fuel}:{" "}
              <strong>${cost.toLocaleString("en-US")}/kW</strong>
            </li>
          ))}
        </ul>
        <p className="text-xs text-[var(--muted)] mt-2">
          Source: EIA,{" "}
          <a
            href="https://www.eia.gov/outlooks/aeo/assumptions/pdf/table_8.2.pdf"
            target="_blank"
            rel="noreferrer"
            className="underline"
          >
            &ldquo;Cost and Performance Characteristics of New Generating Technologies,&rdquo;
            Annual Energy Outlook 2022
          </a>
          , Table 1 (national-average overnight capital costs, 2021 dollars).
        </p>
        <h3 className="text-sm font-semibold mt-4 mb-2">What&rsquo;s NOT estimated, and why</h3>
        <p className="text-sm">
          Transmission, pipeline, and LNG projects are not run through this formula. A
          transmission line&rsquo;s cost is driven by route length and terrain, not a $/kW
          generation-capacity figure, and EIA&rsquo;s table doesn&rsquo;t cover it — we&rsquo;d
          rather show &ldquo;not estimated&rdquo; than invent a proxy we couldn&rsquo;t defend to
          the same standard.
        </p>
      </section>

      <section className="rounded-lg border border-[var(--border)] bg-[var(--panel)] p-5">
        <h2 className="text-lg font-semibold mb-2">Clean energy capacity waiting</h2>
        <p className="text-sm">
          A simple sum of MW capacity for matching projects using a zero-direct-emission
          technology —{" "}
          {ZERO_CARBON_FUELS.map((f, i) => (
            <span key={f}>
              {i > 0 && ", "}
              {FUEL_TYPE_BY_VALUE[f]?.label ?? f}
            </span>
          ))}
          . It&rsquo;s the same &ldquo;Capacity waiting&rdquo; total, just filtered to the
          zero-carbon subset — not an emissions or generation-value estimate, so it carries none
          of the assumptions those would.
        </p>
      </section>

      <section className="rounded-lg border border-[var(--border)] bg-[var(--panel)] p-5">
        <h2 className="text-lg font-semibold mb-2">Aggregate headline stats</h2>
        <p className="text-sm">
          Total capacity, total clean energy capacity, and total investment waiting sum only over
          projects in the <em>current filtered set</em> — they update live as you filter. Entries
          flagged <code>isAggregateExample</code> are always excluded from these totals, since
          they&rsquo;d represent a regional statistic (e.g. an entire ISO interconnection queue)
          rather than one physical project and would double-count against individual projects also
          shown. No currently-ingested source produces one of these, but the exclusion stays in
          place for whenever one does.
        </p>
      </section>

      <section className="rounded-lg border border-[var(--border)] bg-[var(--panel)] p-5">
        <h2 className="text-lg font-semibold mb-2">Data &amp; sourcing</h2>
        <p className="text-sm mb-4">
          Every project on this site comes from one of the public data sources below, refreshed on
          a daily automated schedule — not a one-off, hand-picked list. Each source links out to
          the original public filing or reporting, not just this site&rsquo;s own summary. We
          intentionally stick to sources we can keep current automatically; see the repo&rsquo;s
          README if you&rsquo;re curious why.
        </p>
        <ul className="text-sm flex flex-col gap-3">
          <li>
            <strong>
              <a
                href="https://www.eia.gov/electricity/data/eia860m/"
                target="_blank"
                rel="noreferrer"
                className="underline"
              >
                EIA-860M
              </a>{" "}
              &ldquo;Planned&rdquo; generator inventory.
            </strong>{" "}
            U.S. Energy Information Administration, published monthly. The backbone list of
            proposed U.S. generation and storage capacity — location, capacity, technology, and
            status for every planned generator above a 250 MW capacity floor. We exclude
            generators already reported under construction, since this site tracks projects still
            waiting for approval, not ones that have already cleared that hurdle.
          </li>
          <li>
            <strong>
              <a
                href="https://www.permits.performance.gov/"
                target="_blank"
                rel="noreferrer"
                className="underline"
              >
                Federal Permitting Dashboard
              </a>
            </strong>{" "}
            (FAST-41 covered projects). Permitting Council data on major energy generation,
            transmission, storage, and pipeline projects undergoing federal environmental review —
            including which federal agency is in the lead. We exclude projects already marked
            Complete or Cancelled.
          </li>
        </ul>
        <p className="text-sm mt-4 pt-4 border-t border-[var(--border)]">
          More sources are coming soon — our data and coverage are always growing, check back
          soon. See the repo&rsquo;s README for the full list of open questions, including
          cross-source project identity matching and data source terms of use, flagged rather
          than silently guessed at.
        </p>
      </section>
    </div>
  );
}
