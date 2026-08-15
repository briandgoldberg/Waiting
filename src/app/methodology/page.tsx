import { ASSUMED_WHOLESALE_PRICE_USD_PER_MWH, CAPACITY_FACTOR_BY_FUEL } from "@/lib/calc/costOfDelay";
import { GRID_AVG_CO2_TONNES_PER_MWH, ZERO_CARBON_FUELS } from "@/lib/calc/co2Avoided";
import { FUEL_TYPE_BY_VALUE } from "@/lib/data/taxonomies";

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
        <h2 className="text-lg font-semibold mb-2">Estimated energy bill impact</h2>
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
          wholesale price — a proxy for the downward pressure on electricity costs this
          generation would have provided (more supply generally puts downward pressure on
          wholesale prices, which flow through to retail bills over time), not a literal
          per-household bill-savings figure or a project-specific revenue forecast. Real capacity
          factors, prices, curtailment, and pass-through to retail rates all vary a lot by
          location, season, and hour.
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
        <h2 className="text-lg font-semibold mb-2">CO2 avoided if online</h2>
        <p className="text-sm mb-3">
          For zero-direct-emission generation projects only (
          {ZERO_CARBON_FUELS.map((f, i) => (
            <span key={f}>
              {i > 0 && ", "}
              {FUEL_TYPE_BY_VALUE[f]?.label ?? f}
            </span>
          ))}
          ) with capacity measured in MW:
        </p>
        <pre className="text-xs bg-black/5 dark:bg-white/10 rounded-md p-3 overflow-x-auto">
{`estimated CO2 avoided
  = capacity (MW) × typical capacity factor × 24 (hours/day) × days waiting
    (same MWh-delayed formula as energy bill impact, above)
  × U.S. national average grid CO2 rate (${GRID_AVG_CO2_TONNES_PER_MWH} metric tons/MWh)`}
        </pre>
        <p className="text-sm mt-3">
          The emissions rate is EIA&rsquo;s reported 2023 U.S. average — about 0.81 lb CO2 per kWh
          generated across the whole grid (
          <a
            href="https://www.eia.gov/tools/faqs/faq.php?id=74"
            target="_blank"
            rel="noreferrer"
            className="underline"
          >
            eia.gov
          </a>
          ) — used as a stand-in for the generation this delayed project would have displaced. In
          practice, the generation actually displaced on the margin (often gas peakers) tends to
          be <em>more</em> carbon-intensive than the full-year average mix used here, so this
          number is more likely an understatement of true avoided emissions than an
          overstatement. Gas projects are deliberately excluded from this calculation even though
          they have a published capacity factor — delaying a gas plant doesn&rsquo;t avoid
          emissions. Storage is excluded because it shifts existing energy rather than generating
          new energy, so it has no well-defined MWh-delayed figure here.
        </p>
      </section>

      <section className="rounded-lg border border-[var(--border)] bg-[var(--panel)] p-5">
        <h2 className="text-lg font-semibold mb-2">Aggregate headline stats</h2>
        <p className="text-sm">
          Total capacity, total CO2 avoided, and total energy bill impact sum only over projects
          in the <em>current filtered set</em> — they update live as you filter. Entries flagged{" "}
          <code>isAggregateExample</code> (currently: the PJM regional interconnection-queue
          entry) are always excluded from these totals, since they represent a regional statistic
          rather than one physical project and would double-count against individual projects
          also shown.
        </p>
      </section>

      <section className="rounded-lg border border-[var(--border)] bg-[var(--panel)] p-5">
        <h2 className="text-lg font-semibold mb-2">Data &amp; sourcing</h2>
        <p className="text-sm mb-4">
          Every project on this site traces back to one of the sources below — each one links out
          to the original public filing or reporting, not just this site&rsquo;s own summary.
        </p>
        <ul className="text-sm flex flex-col gap-3">
          <li>
            <strong>Hand-curated, individually cited projects.</strong> A small set of
            high-profile transmission, LNG, offshore wind, nuclear, solar, and pipeline projects,
            each checked against public dockets, court filings, and reporting (FERC, BOEM, EPA,
            trade press). These are the most detailed entries on the site, with full milestone
            timelines.
          </li>
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
            status for every planned generator above a capacity threshold.
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
