"use client";

import { FUEL_TYPES, PROJECT_STAGES, PROJECT_TYPES } from "@/lib/data/taxonomies";
import { SOURCE_OPTIONS } from "@/lib/filters";
import type { FilterState, SourceKey } from "@/lib/filters";
import type { FuelType, ProjectStage, ProjectType } from "@/lib/data/taxonomies";

function toggle<T>(arr: T[], value: T): T[] {
  return arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-[var(--border)] py-3 last:border-b-0">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)] mb-2">
        {title}
      </h3>
      {children}
    </div>
  );
}

function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-2.5 py-1 rounded-full text-xs border transition-colors ${
        active
          ? "bg-[var(--accent)] border-[var(--accent)] text-white"
          : "border-[var(--border)] hover:bg-black/5 dark:hover:bg-white/10"
      }`}
    >
      {children}
    </button>
  );
}

export function FilterPanel({
  filters,
  onChange,
}: {
  filters: FilterState;
  onChange: (f: FilterState) => void;
}) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--panel)] p-4">
      <Section title="Length of delay">
        <div className="flex flex-wrap gap-1.5">
          {[1, 3, 5].map((n) => (
            <Pill
              key={n}
              active={filters.minYearsWaiting === n}
              onClick={() =>
                onChange({
                  ...filters,
                  minYearsWaiting: filters.minYearsWaiting === n ? null : n,
                })
              }
            >
              {n}+ years
            </Pill>
          ))}
        </div>
      </Section>

      <Section title="Project type">
        <div className="flex flex-wrap gap-1.5">
          {PROJECT_TYPES.map((t) => (
            <Pill
              key={t.value}
              active={filters.projectTypes.includes(t.value)}
              onClick={() =>
                onChange({ ...filters, projectTypes: toggle<ProjectType>(filters.projectTypes, t.value) })
              }
            >
              {t.label}
            </Pill>
          ))}
        </div>
      </Section>

      <Section title="Fuel / technology">
        <div className="flex flex-wrap gap-1.5">
          {FUEL_TYPES.map((f) => (
            <Pill
              key={f.value}
              active={filters.fuelTypes.includes(f.value)}
              onClick={() => onChange({ ...filters, fuelTypes: toggle<FuelType>(filters.fuelTypes, f.value) })}
            >
              {f.label}
            </Pill>
          ))}
        </div>
      </Section>

      <Section title="Capacity">
        <div className="flex flex-wrap gap-1.5">
          {[500, 1000, 2000].map((n) => (
            <Pill
              key={n}
              active={filters.minCapacity === n}
              onClick={() =>
                onChange({
                  ...filters,
                  minCapacity: filters.minCapacity === n ? null : n,
                })
              }
            >
              {n.toLocaleString("en-US")}+ MW
            </Pill>
          ))}
        </div>
      </Section>

      <Section title="Stage">
        <div className="flex flex-wrap gap-1.5">
          {PROJECT_STAGES.map((s) => (
            <Pill
              key={s.value}
              active={filters.stages.includes(s.value)}
              onClick={() => onChange({ ...filters, stages: toggle<ProjectStage>(filters.stages, s.value) })}
            >
              {s.label}
            </Pill>
          ))}
        </div>
      </Section>

      <Section title="Data source">
        <div className="flex flex-wrap gap-1.5">
          {SOURCE_OPTIONS.map((s) => (
            <Pill
              key={s.value}
              active={filters.sourceKeys.includes(s.value)}
              onClick={() =>
                onChange({ ...filters, sourceKeys: toggle<SourceKey>(filters.sourceKeys, s.value) })
              }
            >
              {s.label}
            </Pill>
          ))}
        </div>
      </Section>
    </div>
  );
}
