// Shared enums/labels for project type, fuel/technology type, and pipeline
// stage. Kept separate from causeCategories.ts because these describe *what*
// a project is / where it's at, not *why* it's delayed.

export type ProjectType =
  | "generation"
  | "transmission"
  | "storage"
  | "lng"
  | "pipeline";

export const PROJECT_TYPES: { value: ProjectType; label: string }[] = [
  { value: "generation", label: "Generation" },
  { value: "transmission", label: "Transmission" },
  { value: "storage", label: "Storage" },
  { value: "lng", label: "LNG" },
  { value: "pipeline", label: "Pipeline" },
];

export type FuelType =
  | "solar"
  | "wind_onshore"
  | "wind_offshore"
  | "storage"
  | "gas"
  | "nuclear"
  | "hydro"
  | "lng"
  | "pipeline"
  | "transmission"
  | "geothermal"
  | "other";

export const FUEL_TYPES: { value: FuelType; label: string; color: string }[] = [
  { value: "solar", label: "Solar", color: "#f59e0b" },
  { value: "wind_onshore", label: "Wind (onshore)", color: "#0ea5e9" },
  { value: "wind_offshore", label: "Wind (offshore)", color: "#0369a1" },
  { value: "storage", label: "Storage", color: "#8b5cf6" },
  { value: "gas", label: "Gas", color: "#b45309" },
  { value: "nuclear", label: "Nuclear", color: "#059669" },
  { value: "hydro", label: "Hydro", color: "#0891b2" },
  { value: "lng", label: "LNG", color: "#ea580c" },
  { value: "pipeline", label: "Pipeline", color: "#78350f" },
  { value: "transmission", label: "Transmission", color: "#4338ca" },
  { value: "geothermal", label: "Geothermal", color: "#be123c" },
  { value: "other", label: "Other", color: "#6b7280" },
];

export const FUEL_TYPE_BY_VALUE: Record<FuelType, { label: string; color: string }> =
  Object.fromEntries(FUEL_TYPES.map(({ value, ...rest }) => [value, rest])) as Record<
    FuelType,
    { label: string; color: string }
  >;

// Technologies with essentially zero direct generation emissions. Used for
// the "clean energy capacity waiting" headline stat — a simple MW sum, not
// an emissions estimate.
export const ZERO_CARBON_FUELS: FuelType[] = [
  "solar",
  "wind_onshore",
  "wind_offshore",
  "nuclear",
  "hydro",
  "geothermal",
];

export type ProjectStage =
  | "interconnection_study"
  | "environmental_review"
  | "agency_permitting"
  | "planned_pre_filing"
  | "regulatory_approvals_pending"
  | "local_review"
  | "litigation"
  | "approved_awaiting_construction"
  | "under_construction"
  | "cancelled"
  | "completed";

// planned_pre_filing and regulatory_approvals_pending map directly to
// EIA-860M's own "Planned" tab status codes (P) and (L) respectively — see
// statusToStage in src/lib/ingest/eia860mPlanned.ts. (L) is EIA's own
// "Category L" ("Regulatory approvals pending. Not under construction");
// kept namewise-parallel to EIA's letter so it's traceable back to the
// source, and labeled with "Category L" in the UI since that's how EIA and
// this site's users refer to it.
export const PROJECT_STAGES: { value: ProjectStage; label: string }[] = [
  { value: "interconnection_study", label: "Interconnection study" },
  { value: "environmental_review", label: "Environmental review" },
  { value: "planned_pre_filing", label: "Planned, approvals not yet initiated" },
  { value: "regulatory_approvals_pending", label: "Regulatory approvals pending (Category L)" },
  { value: "agency_permitting", label: "Agency permitting" },
  { value: "local_review", label: "Local/state review" },
  { value: "litigation", label: "Litigation" },
  { value: "approved_awaiting_construction", label: "Approved, awaiting construction" },
  { value: "under_construction", label: "Under construction" },
  { value: "cancelled", label: "Cancelled" },
  { value: "completed", label: "Completed" },
];

// This site tracks projects still waiting on a regulatory yes — a project
// that has already cleared approval, started construction, been
// cancelled, or finished is no longer "waiting" by definition (see
// README's framing). Per explicit product decision, these four stages are
// excluded from the site entirely rather than just deprioritized: no
// ingestion module may create a project in one of these stages, and
// upsertNormalizedProject (src/lib/ingest/common.ts) deletes any
// previously-tracked project whose stage transitions into one of these on
// a later ingestion run, rather than leaving a stale "still waiting" row
// behind. See PROJECT_STAGES above for their labels — kept defined (not
// deleted from the type) since they're still meaningful values a source
// can report, just not ones this site displays.
export const RESOLVED_STAGES: ProjectStage[] = [
  "approved_awaiting_construction",
  "under_construction",
  "cancelled",
  "completed",
];

// PROJECT_STAGES filtered to the stages a project can actually have on
// this site — for filter-pill UI, so users never see a filter option that
// always returns zero results.
export const TRACKED_PROJECT_STAGES = PROJECT_STAGES.filter(
  (s) => !RESOLVED_STAGES.includes(s.value),
);

export const PROJECT_STAGE_BY_VALUE: Record<ProjectStage, string> = Object.fromEntries(
  PROJECT_STAGES.map(({ value, label }) => [value, label]),
) as Record<ProjectStage, string>;

export type VerificationStatus =
  | "verified"
  | "user_submitted_pending"
  | "user_submitted_verified";

export const VERIFICATION_STATUSES: { value: VerificationStatus; label: string }[] = [
  { value: "verified", label: "Verified (primary source)" },
  { value: "user_submitted_verified", label: "User-submitted, verified" },
  { value: "user_submitted_pending", label: "User-submitted, pending review" },
];

export function formatCapacity(value: number | null, unit: string | null): string {
  if (value == null) return "Not disclosed";
  const rounded = value >= 100 ? Math.round(value).toLocaleString("en-US") : value;
  return `${rounded} ${unit ?? ""}`.trim();
}
