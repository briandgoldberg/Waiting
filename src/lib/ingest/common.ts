// Shared types and helpers for all ingestion modules. Each module in this
// directory normalizes one external data source into `NormalizedProject`,
// which `upsertNormalizedProject` then writes into the Prisma schema.
//
// IDENTITY MATCHING (the hardest part, per the project brief): EIA, the
// Permitting Dashboard, and LBNL each use their own project names/IDs for
// what may be the same physical project (e.g. a transmission line might be
// "Grain Belt Express Transmission - Phase 1" on the Permitting Dashboard
// and something else entirely in an ISO interconnection queue). v1 does NOT
// attempt automated fuzzy-matching/deduplication across sources — that's
// flagged as an open question in README.md rather than guessed at with a
// name-similarity heuristic that would silently merge or split real
// projects incorrectly. Instead:
//   - Each source's ingestion module tags every project with its own
//     `externalIds` (source name + source's own ID) so matches can be added
//     deliberately later.
//   - `manualOverrides.ts` (CSV or inline) lets a human explicitly declare
//     "EIA plant 12345 generator 1 == Permitting Dashboard project 71536 ==
//     LBNL queue id Q4821" via a shared `matchKey`. Only projects sharing a
//     manually-assigned `matchKey` are ever merged into one Project row.

import { prisma } from "@/lib/db";
import type { CauseSlug } from "@/lib/data/causeCategories";
import type { FuelType, ProjectStage, ProjectType } from "@/lib/data/taxonomies";

export interface NormalizedSource {
  label: string;
  url: string;
}

export interface NormalizedMilestone {
  date: Date;
  dateConfidence?: "exact" | "approximate";
  stage: string;
  description: string;
}

export interface NormalizedProject {
  /**
   * Stable identity key for this project. If a manual override maps this
   * source record to a shared `matchKey`, use that; otherwise fall back to
   * `${sourceName}:${sourceId}` so records from a single source are at
   * least internally deduplicated across repeated ingestion runs.
   */
  matchKey: string;
  name: string;
  projectType: ProjectType;
  fuelType: FuelType;
  lat?: number | null;
  lon?: number | null;
  state?: string | null;
  county?: string | null;
  capacityValue?: number | null;
  capacityUnit?: string | null;
  applicationFiledDate?: Date | null;
  dateConfidence?: "exact" | "approximate";
  currentStatus: string;
  currentStage: ProjectStage;
  causeSlugs: CauseSlug[];
  causeDetail: string;
  isAggregateExample?: boolean;
  estimatedMwDelayed?: number | null;
  dataQualityNote?: string | null;
  sources: NormalizedSource[];
  milestones?: NormalizedMilestone[];
  /** e.g. { eia: "plantid-generatorid", permittingDashboard: "71536" } */
  externalIds: Record<string, string>;
}

function slugify(name: string, matchKey: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  const suffix = matchKey.slice(-6).replace(/[^a-z0-9]/gi, "");
  return `${base}-${suffix}`.slice(0, 90);
}

/**
 * Upserts a normalized project keyed by `matchKey`. Since Prisma's schema
 * doesn't have a unique column for `matchKey` (it's an ingestion-time-only
 * concept, not part of the public schema), we look up by slug derived from
 * it. Verified/ingested projects always get verificationStatus="verified" —
 * this path is never used for user submissions (see src/app/api/submissions).
 */
export async function upsertNormalizedProject(p: NormalizedProject) {
  const slug = slugify(p.name, p.matchKey);

  const project = await prisma.project.upsert({
    where: { slug },
    create: {
      slug,
      name: p.name,
      projectType: p.projectType,
      fuelType: p.fuelType,
      lat: p.lat ?? null,
      lon: p.lon ?? null,
      state: p.state ?? null,
      county: p.county ?? null,
      capacityValue: p.capacityValue ?? null,
      capacityUnit: p.capacityUnit ?? null,
      applicationFiledDate: p.applicationFiledDate ?? null,
      dateConfidence: p.dateConfidence ?? "exact",
      currentStatus: p.currentStatus,
      currentStage: p.currentStage,
      causeDetail: p.causeDetail,
      isAggregateExample: p.isAggregateExample ?? false,
      estimatedMwDelayed: p.estimatedMwDelayed ?? null,
      verificationStatus: "verified",
      dataQualityNote: p.dataQualityNote ?? null,
    },
    update: {
      name: p.name,
      projectType: p.projectType,
      fuelType: p.fuelType,
      lat: p.lat ?? null,
      lon: p.lon ?? null,
      state: p.state ?? null,
      county: p.county ?? null,
      capacityValue: p.capacityValue ?? null,
      capacityUnit: p.capacityUnit ?? null,
      applicationFiledDate: p.applicationFiledDate ?? null,
      dateConfidence: p.dateConfidence ?? "exact",
      currentStatus: p.currentStatus,
      currentStage: p.currentStage,
      causeDetail: p.causeDetail,
      isAggregateExample: p.isAggregateExample ?? false,
      estimatedMwDelayed: p.estimatedMwDelayed ?? null,
      dataQualityNote: p.dataQualityNote ?? null,
    },
  });

  await prisma.projectCause.deleteMany({ where: { projectId: project.id } });
  await prisma.projectCause.createMany({
    data: p.causeSlugs.map((causeSlug) => ({ projectId: project.id, causeSlug })),
  });

  await prisma.projectSource.deleteMany({ where: { projectId: project.id } });
  if (p.sources.length > 0) {
    await prisma.projectSource.createMany({
      data: p.sources.map((s) => ({ projectId: project.id, label: s.label, url: s.url })),
    });
  }

  if (p.milestones && p.milestones.length > 0) {
    await prisma.milestone.deleteMany({ where: { projectId: project.id } });
    await prisma.milestone.createMany({
      data: p.milestones.map((m) => ({
        projectId: project.id,
        date: m.date,
        dateConfidence: m.dateConfidence ?? "exact",
        stage: m.stage,
        description: m.description,
      })),
    });
  }

  return project;
}

/**
 * Upserts many projects with limited concurrency instead of one at a time.
 * `upsertNormalizedProject` does ~5 sequential DB round trips per project;
 * run fully sequentially, a few hundred projects takes minutes — too slow
 * for a serverless function's execution time limit (see the EIA-860M cron
 * route, src/app/api/cron/ingest-eia/route.ts). Running a bounded number of
 * projects concurrently instead cuts that to seconds, without opening so
 * many connections at once that the database chokes.
 */
export async function upsertNormalizedProjects(
  projects: NormalizedProject[],
  concurrency = 40,
): Promise<{ upserted: number; errors: { matchKey: string; message: string }[] }> {
  let upserted = 0;
  const errors: { matchKey: string; message: string }[] = [];

  for (let i = 0; i < projects.length; i += concurrency) {
    const batch = projects.slice(i, i + concurrency);
    const results = await Promise.allSettled(batch.map((p) => upsertNormalizedProject(p)));
    for (let j = 0; j < results.length; j++) {
      const result = results[j];
      if (result.status === "fulfilled") {
        upserted += 1;
      } else {
        errors.push({ matchKey: batch[j].matchKey, message: String(result.reason) });
      }
    }
  }

  return { upserted, errors };
}
