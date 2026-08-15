import type { ProjectDTO } from "@/lib/types";
import type { CauseSlug } from "@/lib/data/causeCategories";
import type { FuelType, ProjectStage, ProjectType } from "@/lib/data/taxonomies";

export interface FilterState {
  minYearsWaiting: number | null; // e.g. 1, 3, 5 quick presets, or null = no minimum
  fuelTypes: FuelType[];
  stages: ProjectStage[];
  causes: CauseSlug[];
  projectTypes: ProjectType[];
  minCapacity: number | null;
  maxCapacity: number | null;
}

export const DEFAULT_FILTERS: FilterState = {
  minYearsWaiting: null,
  fuelTypes: [],
  stages: [],
  causes: [],
  projectTypes: [],
  minCapacity: null,
  maxCapacity: null,
};

export function hasActiveFilters(f: FilterState): boolean {
  return (
    f.minYearsWaiting != null ||
    f.fuelTypes.length > 0 ||
    f.stages.length > 0 ||
    f.causes.length > 0 ||
    f.projectTypes.length > 0 ||
    f.minCapacity != null ||
    f.maxCapacity != null
  );
}

export function matchesFilters(p: ProjectDTO, f: FilterState): boolean {
  if (f.minYearsWaiting != null) {
    if (p.yearsWaiting == null || p.yearsWaiting < f.minYearsWaiting) return false;
  }
  if (f.fuelTypes.length > 0 && !f.fuelTypes.includes(p.fuelType)) return false;
  if (f.stages.length > 0 && !f.stages.includes(p.currentStage)) return false;
  if (f.causes.length > 0 && !p.causeSlugs.some((c) => f.causes.includes(c))) return false;
  if (f.projectTypes.length > 0 && !f.projectTypes.includes(p.projectType)) return false;
  if (f.minCapacity != null && (p.capacityValue == null || p.capacityValue < f.minCapacity)) return false;
  if (f.maxCapacity != null && (p.capacityValue == null || p.capacityValue > f.maxCapacity)) return false;
  return true;
}

export interface FilterChip {
  key: string;
  label: string;
  onRemove: (f: FilterState) => FilterState;
}

export function buildChips(f: FilterState): FilterChip[] {
  const chips: FilterChip[] = [];
  if (f.minYearsWaiting != null) {
    chips.push({
      key: "minYears",
      label: `${f.minYearsWaiting}+ years waiting`,
      onRemove: (state) => ({ ...state, minYearsWaiting: null }),
    });
  }
  for (const ft of f.fuelTypes) {
    chips.push({
      key: `fuel-${ft}`,
      label: ft,
      onRemove: (state) => ({ ...state, fuelTypes: state.fuelTypes.filter((x) => x !== ft) }),
    });
  }
  for (const s of f.stages) {
    chips.push({
      key: `stage-${s}`,
      label: s.replace(/_/g, " "),
      onRemove: (state) => ({ ...state, stages: state.stages.filter((x) => x !== s) }),
    });
  }
  for (const c of f.causes) {
    chips.push({
      key: `cause-${c}`,
      label: c.replace(/_/g, " "),
      onRemove: (state) => ({ ...state, causes: state.causes.filter((x) => x !== c) }),
    });
  }
  for (const pt of f.projectTypes) {
    chips.push({
      key: `type-${pt}`,
      label: pt,
      onRemove: (state) => ({ ...state, projectTypes: state.projectTypes.filter((x) => x !== pt) }),
    });
  }
  if (f.minCapacity != null || f.maxCapacity != null) {
    chips.push({
      key: "capacity",
      label: `Capacity ${f.minCapacity ?? 0}–${f.maxCapacity ?? "∞"} MW`,
      onRemove: (state) => ({ ...state, minCapacity: null, maxCapacity: null }),
    });
  }
  return chips;
}
