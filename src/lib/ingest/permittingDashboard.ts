// Federal Permitting Dashboard ingestion (FAST-41 covered/transparency
// projects) — primary source for "which agency is the bottleneck" and
// official project status.
//
// v1 uses the public, unauthenticated Socrata Open Data (SODA) API at
// data.permits.performance.gov rather than the token-gated
// permits.performance.gov/api/v1/project/{id} endpoint mentioned in the
// dashboard's own API docs — registering for a token was out of scope for
// this pass, and the open data portal turned out to have the project list
// with no auth required. Verified live during development of this module:
//
//   GET https://data.permits.performance.gov/resource/fh3k-bqsc.json
//   ("FAST-41 Projects Data") returned real rows with these fields:
//     project_id, project_title, project_field_project_lead_agency,
//     project_field_project_lead_agency_bureau, project_category,
//     project_field_project_status, project_sector, project_sector_type,
//     project_field_location_state, project_field_location_county,
//     project_field_location_city, project_lat, project_lon,
//     total_estimated_project_cost, project_url
//
// OPEN QUESTIONS (flagged rather than guessed at — see README):
//   1. No per-project milestone/timeline or "application filed" date field
//      was found on this dataset. The dashboard clearly has that data (it's
//      the whole point of the "timeline milestones" feature mentioned in
//      the project brief) — it's likely behind the token-gated
//      /api/v1/project/{id} endpoint, or in another Socrata dataset on the
//      portal we didn't identify. Projects ingested from this source will
//      have `applicationFiledDate: null` until that's resolved.
//   2. No fuel/technology-specific field was found (only `project_sector`,
//      e.g. "Renewable Energy Production", "Conventional Energy
//      Production", "Electricity Transmission", "Energy Storage",
//      "Pipelines"). `fuelType` below is inferred from keywords in the
//      project title, which is unreliable — treat every Permitting
//      Dashboard-sourced `fuelType` as provisional pending manual review.
//   3. Cause category (interconnection queue vs. NEPA vs. multi-agency vs.
//      ...) is not a field on this dataset either. `project_category` /
//      `project_field_project_lead_agency` narrow it down (e.g. multiple
//      agencies listed suggests multi-agency permitting) but v1 does not
//      attempt that inference automatically — causeSlugs ships empty and
//      needs manual assignment, same as the EIA module.
//   4. Terms of use / redistribution: this is a Socrata-hosted federal
//      (.gov) open data portal, and federal government works are generally
//      public domain under 17 U.S.C. §105, which is consistent with what
//      resources.data.gov documents about default federal open-data
//      licensing. We did not find a dataset-specific terms-of-use page
//      confirming this explicitly for data.permits.performance.gov —
//      confirm before any large-scale redistribution of the raw dataset.
//
// IMPORTANT — like eia.ts, this module is NOT run automatically by
// prisma/seed.ts. Run `npx tsx src/lib/ingest/permittingDashboard.ts`
// yourself to pull the live dataset.

import type { CauseSlug } from "@/lib/data/causeCategories";
import type { FuelType, ProjectStage, ProjectType } from "@/lib/data/taxonomies";
import { resolveMatchKey } from "@/lib/ingest/manualOverrides";
import { upsertNormalizedProjects, type NormalizedProject } from "@/lib/ingest/common";

const SOCRATA_BASE = "https://data.permits.performance.gov/resource/fh3k-bqsc.json";

const ENERGY_SECTORS = [
  "Conventional Energy Production",
  "Renewable Energy Production",
  "Electricity Transmission",
  "Energy Storage",
  "Pipelines",
];

const SECTOR_TO_PROJECT_TYPE: Record<string, ProjectType> = {
  "Electricity Transmission": "transmission",
  "Energy Storage": "storage",
  Pipelines: "pipeline",
  "Conventional Energy Production": "generation",
  "Renewable Energy Production": "generation",
};

const TITLE_KEYWORD_TO_FUEL: [RegExp, FuelType][] = [
  [/\bLNG\b|liquefi(ed|action)/i, "lng"],
  [/solar|photovoltaic|\bPV\b/i, "solar"],
  [/offshore wind/i, "wind_offshore"],
  [/\bwind\b/i, "wind_onshore"],
  [/nuclear|reactor|\bSMR\b/i, "nuclear"],
  [/hydro|dam\b/i, "hydro"],
  [/geothermal/i, "geothermal"],
  [/battery|storage/i, "storage"],
  [/pipeline|gas transmission/i, "pipeline"],
  [/transmission line|transmission project|\bkV\b/i, "transmission"],
];

function inferFuelType(title: string, sector: string): FuelType {
  for (const [re, fuel] of TITLE_KEYWORD_TO_FUEL) {
    if (re.test(title)) return fuel;
  }
  if (sector === "Pipelines") return "pipeline";
  if (sector === "Electricity Transmission") return "transmission";
  if (sector === "Energy Storage") return "storage";
  return "other";
}

function statusToStage(status: string): ProjectStage {
  const s = status.toLowerCase();
  if (s.includes("complete")) return "completed";
  if (s.includes("cancel") || s.includes("withdraw")) return "cancelled";
  if (s.includes("construction")) return "under_construction";
  // Best-effort default — see OPEN QUESTION #3 above.
  return "agency_permitting";
}

interface DashboardRecord {
  project_id: string;
  project_title: string;
  project_field_project_lead_agency?: string;
  project_field_project_lead_agency_bureau?: string;
  project_category?: string;
  project_field_project_status?: string;
  project_sector: string;
  project_sector_type?: string;
  project_field_location_state?: string;
  project_field_location_county?: string;
  project_lat?: string;
  project_lon?: string;
  total_estimated_project_cost?: string;
  project_url?: { url: string };
}

// This Socrata dataset is a denormalized join, not one row per project —
// confirmed live on 2026-08-15: querying the energy sectors returned 3,378
// raw rows but only 102 unique `project_id` values, with the "duplicates"
// being byte-for-byte identical (not milestone/timeline variants that would
// differ by date). Dedupe by project_id before normalizing, or the
// (now-batched) upsert step does 33x more DB writes than necessary for the
// same end result.
//
// STATUS FILTER: of the 102 unique projects, 48 are "Complete" and 20 are
// "Cancelled" — neither is "waiting" on anything anymore. Excluded, per
// explicit product decision, leaving only In Progress / Planned / Paused
// (34 projects as of 2026-08-15). Adjust EXCLUDED_STATUSES and re-run any
// time — upserts are idempotent by project_id either way.
const EXCLUDED_STATUSES = ["Complete", "Cancelled"];

// Cross-source identity matching (README open question #1): these
// Permitting Dashboard project_ids are the SAME physical project as an
// existing hand-curated seed entry (prisma/seed.ts), confirmed by name and
// (for Grain Belt Express) a matching Permitting Dashboard URL already
// cited in the seed entry's own sources. The seed entries bypass the
// matchKey/slugify pipeline entirely (hardcoded slugs in seed.ts), so a
// manualOverrides.csv row can't make this ingestion path land on the same
// row automatically — simplest honest fix is to skip these specific IDs
// here, in favor of the more detailed hand-researched entry. Confirmed
// live on 2026-08-15. Revisit if the seed entries are ever migrated onto
// the shared matchKey system.
const KNOWN_DUPLICATE_PROJECT_IDS: Record<string, string> = {
  "109441": "Grain Belt Express Transmission — Phase 1 (seed entry, more detailed)",
  "95051": "SouthCoast Wind (seed entry, more detailed)",
  "74166": "Ocean Wind 1 (seed entry — also more accurately shows status as cancelled)",
};

async function fetchAll(): Promise<DashboardRecord[]> {
  const sectorClause = ENERGY_SECTORS.map((s) => `'${s}'`).join(",");
  const params = new URLSearchParams({
    $where: `project_sector in(${sectorClause})`,
    $limit: "5000",
  });
  const res = await fetch(`${SOCRATA_BASE}?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`Permitting Dashboard API error ${res.status}: ${await res.text()}`);
  }
  const rows = (await res.json()) as DashboardRecord[];

  const seen = new Set<string>();
  const deduped: DashboardRecord[] = [];
  for (const row of rows) {
    if (seen.has(row.project_id)) continue;
    if (EXCLUDED_STATUSES.includes(row.project_field_project_status ?? "")) continue;
    if (row.project_id in KNOWN_DUPLICATE_PROJECT_IDS) continue;
    seen.add(row.project_id);
    deduped.push(row);
  }
  return deduped;
}

export function normalizeDashboardRecord(r: DashboardRecord): NormalizedProject {
  const matchKey = resolveMatchKey("permittingDashboard", r.project_id);
  const fuelType = inferFuelType(r.project_title, r.project_sector);
  const projectType = SECTOR_TO_PROJECT_TYPE[r.project_sector] ?? "generation";
  const status = r.project_field_project_status ?? "Unknown";
  const causeSlugs: CauseSlug[] = [];

  const agencies = [r.project_field_project_lead_agency, r.project_field_project_lead_agency_bureau]
    .filter(Boolean)
    .join(" / ");

  return {
    matchKey,
    name: r.project_title,
    projectType,
    fuelType,
    lat: r.project_lat ? Number(r.project_lat) : null,
    lon: r.project_lon ? Number(r.project_lon) : null,
    state: r.project_field_location_state ?? null,
    county: r.project_field_location_county ?? null,
    capacityValue: null, // not published on this dataset
    capacityUnit: null,
    applicationFiledDate: null, // see OPEN QUESTION #1
    currentStatus: agencies ? `${status} (lead: ${agencies})` : status,
    currentStage: statusToStage(status),
    causeSlugs,
    causeDetail:
      "Imported from the Federal Permitting Dashboard (FAST-41). Cause category and application-filed date are not published on the public open-data endpoint used for this import — see src/lib/ingest/permittingDashboard.ts OPEN QUESTIONS for what's missing and why.",
    dataQualityNote:
      "fuelType is inferred from keywords in the project title, not a structured field on this source — treat as provisional.",
    sources: [
      {
        label: "Federal Permitting Dashboard",
        url: r.project_url?.url ?? `https://www.permits.performance.gov/permitting-project/${r.project_id}`,
      },
    ],
    externalIds: { permittingDashboard: r.project_id },
  };
}

export async function ingestPermittingDashboard() {
  const rows = await fetchAll();
  const normalized = rows.map(normalizeDashboardRecord);
  const { upserted, errors } = await upsertNormalizedProjects(normalized);
  console.log(
    `Permitting Dashboard ingestion complete: upserted ${upserted} projects (${errors.length} errors).`,
  );
  if (errors.length > 0) console.error(errors);
  return { upserted, errors };
}

if (require.main === module) {
  ingestPermittingDashboard().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
