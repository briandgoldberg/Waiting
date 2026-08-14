"use client";

import Link from "next/link";
import type { AggregateStats, ProjectDTO } from "@/lib/types";
import { formatUsd, ASSUMED_WHOLESALE_PRICE_USD_PER_MWH } from "@/lib/calc/costOfDelay";
import { formatTonnesCo2, GRID_AVG_CO2_TONNES_PER_MWH } from "@/lib/calc/co2Avoided";
import { HelpTooltip } from "@/components/HelpTooltip";

function pct(cf: number): string {
  return `${(cf * 100).toFixed(0)}%`;
}

function ExampleNote({ children }: { children: React.ReactNode }) {
  return <p className="mt-2 pt-2 border-t border-[var(--border)] text-[var(--muted)]">{children}</p>;
}

export function StatsHeader({
  stats,
  exampleProject,
}: {
  stats: AggregateStats;
  exampleProject: ProjectDTO | null;
}) {
  const ex = exampleProject;

  const items = [
    {
      label: "Projects tracked",
      value: stats.totalProjects.toLocaleString("en-US"),
      help: (
        <>
          <p>
            Every project matching your current filters, except regional-aggregate entries (like a
            statewide or ISO-wide statistic standing in for many projects) — those would
            double-count against the individual projects also shown, so they&rsquo;re excluded from
            this count.
          </p>
          {ex && (
            <ExampleNote>
              E.g. <strong>{ex.name}</strong> ({ex.state ?? "location n/a"}) is one of the{" "}
              {stats.totalProjects} counted right now.
            </ExampleNote>
          )}
        </>
      ),
    },
    {
      label: "Capacity waiting",
      value: `${Math.round(stats.totalCapacityMw).toLocaleString("en-US")} MW`,
      help: (
        <>
          <p>
            Sums the MW capacity of every matching project. Projects whose capacity is measured in
            a different unit (LNG&rsquo;s MTPA, a pipeline&rsquo;s length/diameter) aren&rsquo;t
            included in this MW total.
          </p>
          {ex && ex.capacityUnit === "MW" && ex.capacityValue != null && (
            <ExampleNote>
              E.g. <strong>{ex.name}</strong> alone contributes{" "}
              {Math.round(ex.capacityValue).toLocaleString("en-US")} MW of the{" "}
              {Math.round(stats.totalCapacityMw).toLocaleString("en-US")} MW total.
            </ExampleNote>
          )}
        </>
      ),
    },
    {
      label: "CO2 avoided if online",
      value: formatTonnesCo2(stats.totalTonnesCo2Avoided),
      note: `${stats.co2AvoidedCoverageCount}/${stats.totalProjects} zero-carbon projects have an applicable estimate`,
      help: (
        <>
          <p>
            For zero-direct-emission generation only (solar, wind, nuclear, hydro, geothermal):
            capacity (MW) × typical capacity factor × 24 hours × days waiting × the U.S. national
            average grid CO2 rate ({GRID_AVG_CO2_TONNES_PER_MWH} t/MWh, EIA 2023). Gas is excluded —
            delaying a gas plant doesn&rsquo;t avoid emissions.
          </p>
          {ex && ex.co2Avoided.applicable && (
            <ExampleNote>
              E.g. <strong>{ex.name}</strong>: {Math.round(ex.capacityValue ?? 0).toLocaleString("en-US")}{" "}
              MW × {pct(ex.co2Avoided.capacityFactor!)} × 24h × {ex.daysWaiting?.toLocaleString("en-US")}{" "}
              days waiting × {GRID_AVG_CO2_TONNES_PER_MWH} t/MWh ≈{" "}
              {Math.round(ex.co2Avoided.estimatedMwhDelayed ?? 0).toLocaleString("en-US")} MWh delayed
              ≈ {formatTonnesCo2(ex.co2Avoided.estimatedTonnesCo2Avoided ?? 0)} avoided.
            </ExampleNote>
          )}
        </>
      ),
    },
    {
      label: "Est. energy bill impact",
      value: formatUsd(stats.totalCostOfDelayUsd),
      note: `${stats.costOfDelayCoverageCount}/${stats.totalProjects} projects have an applicable estimate`,
      help: (
        <>
          <p>
            For generation/storage projects with a published capacity factor: capacity (MW) ×
            typical capacity factor × 24 hours × days waiting × an assumed $
            {ASSUMED_WHOLESALE_PRICE_USD_PER_MWH}/MWh wholesale price. A proxy for the downward
            pressure on electricity costs this power would have provided — not a literal
            per-household bill line item.
          </p>
          {ex && ex.costOfDelay.applicable && (
            <ExampleNote>
              E.g. <strong>{ex.name}</strong>: {Math.round(ex.capacityValue ?? 0).toLocaleString("en-US")}{" "}
              MW × {pct(ex.costOfDelay.capacityFactor!)} × 24h × {ex.daysWaiting?.toLocaleString("en-US")}{" "}
              days waiting × ${ASSUMED_WHOLESALE_PRICE_USD_PER_MWH}/MWh ≈{" "}
              {Math.round(ex.costOfDelay.estimatedMwhUndelivered ?? 0).toLocaleString("en-US")} MWh ≈{" "}
              {formatUsd(ex.costOfDelay.estimatedUsd ?? 0)}.
            </ExampleNote>
          )}
        </>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {items.map((item) => (
        <div key={item.label} className="rounded-lg border border-[var(--border)] bg-[var(--panel)] p-3">
          <div className="text-2xl font-bold tabular-nums">{item.value}</div>
          <div className="text-xs text-[var(--muted)] mt-0.5 flex items-center gap-1">
            {item.label}
            <HelpTooltip label={item.label}>{item.help}</HelpTooltip>
          </div>
          {item.note && <div className="text-[10px] text-[var(--muted)] mt-1">{item.note}</div>}
        </div>
      ))}
      <div className="col-span-2 sm:col-span-4 text-[11px] text-[var(--muted)]">
        Stats update live as you filter below. CO2 avoided and energy bill impact are documented
        estimates, not precise figures —{" "}
        <Link href="/methodology" className="underline">
          see methodology
        </Link>
        . Regional-aggregate entries (not individual projects) are excluded from these totals.
      </div>
    </div>
  );
}
