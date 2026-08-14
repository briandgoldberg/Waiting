"use client";

import { CAUSE_CATEGORIES } from "@/lib/data/causeCategories";
import { FUEL_TYPES, PROJECT_STAGES, PROJECT_TYPES, VERIFICATION_STATUSES } from "@/lib/data/taxonomies";
import type { FilterState } from "@/lib/filters";
import type { CauseSlug } from "@/lib/data/causeCategories";
import type { FuelType, ProjectStage, ProjectType, VerificationStatus } from "@/lib/data/taxonomies";

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
  availableStates,
}: {
  filters: FilterState;
  onChange: (f: FilterState) => void;
  availableStates: string[];
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

      <Section title="Current stage">
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

      <Section title="Cause">
        <div className="flex flex-col gap-1.5">
          {CAUSE_CATEGORIES.map((c) => (
            <label key={c.slug} className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={filters.causes.includes(c.slug)}
                onChange={() => onChange({ ...filters, causes: toggle<CauseSlug>(filters.causes, c.slug) })}
              />
              <span
                className="inline-block h-2.5 w-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: c.color }}
              />
              {c.label}
            </label>
          ))}
        </div>
      </Section>

      <Section title="State">
        <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
          {availableStates.map((st) => (
            <Pill
              key={st}
              active={filters.states.includes(st)}
              onClick={() => onChange({ ...filters, states: toggle<string>(filters.states, st) })}
            >
              {st}
            </Pill>
          ))}
        </div>
      </Section>

      <Section title="Capacity range (MW)">
        <div className="flex items-center gap-2 text-sm">
          <input
            type="number"
            placeholder="Min"
            className="w-20 rounded border border-[var(--border)] bg-transparent px-2 py-1"
            value={filters.minCapacity ?? ""}
            onChange={(e) =>
              onChange({ ...filters, minCapacity: e.target.value === "" ? null : Number(e.target.value) })
            }
          />
          <span className="text-[var(--muted)]">–</span>
          <input
            type="number"
            placeholder="Max"
            className="w-20 rounded border border-[var(--border)] bg-transparent px-2 py-1"
            value={filters.maxCapacity ?? ""}
            onChange={(e) =>
              onChange({ ...filters, maxCapacity: e.target.value === "" ? null : Number(e.target.value) })
            }
          />
        </div>
      </Section>

      <Section title="Data source / verification">
        <div className="flex flex-col gap-1.5">
          {VERIFICATION_STATUSES.map((v) => (
            <label key={v.value} className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={filters.verificationStatuses.includes(v.value)}
                onChange={() =>
                  onChange({
                    ...filters,
                    verificationStatuses: toggle<VerificationStatus>(filters.verificationStatuses, v.value),
                  })
                }
              />
              {v.label}
            </label>
          ))}
        </div>
      </Section>
    </div>
  );
}
