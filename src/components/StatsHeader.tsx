"use client";

import Link from "next/link";
import type { AggregateStats } from "@/lib/types";
import { formatUsd } from "@/lib/calc/costOfDelay";

export function StatsHeader({ stats }: { stats: AggregateStats }) {
  const items = [
    { label: "Projects tracked", value: stats.totalProjects.toLocaleString("en-US") },
    {
      label: "Capacity waiting",
      value: `${Math.round(stats.totalCapacityMw).toLocaleString("en-US")} MW`,
    },
    {
      label: "Project-years lost",
      value: stats.totalProjectYears.toLocaleString("en-US", { maximumFractionDigits: 0 }),
    },
    {
      label: "Est. cost of delay",
      value: formatUsd(stats.totalCostOfDelayUsd),
      note: `${stats.costOfDelayCoverageCount}/${stats.totalProjects} projects have an applicable estimate`,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {items.map((item) => (
        <div key={item.label} className="rounded-lg border border-[var(--border)] bg-[var(--panel)] p-3">
          <div className="text-2xl font-bold tabular-nums">{item.value}</div>
          <div className="text-xs text-[var(--muted)] mt-0.5">{item.label}</div>
          {item.note && <div className="text-[10px] text-[var(--muted)] mt-1">{item.note}</div>}
        </div>
      ))}
      <div className="col-span-2 sm:col-span-4 text-[11px] text-[var(--muted)]">
        Stats update live as you filter below. Cost-of-delay is a documented estimate, not a
        precise figure —{" "}
        <Link href="/methodology" className="underline">
          see methodology
        </Link>
        . Regional-aggregate entries (not individual projects) are excluded from these totals.
      </div>
    </div>
  );
}
