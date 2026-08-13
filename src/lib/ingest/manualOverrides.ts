// Manual/CSV override path for cases where automated cross-source project
// identity matching fails (see common.ts header comment). Each row declares
// that a specific source record should adopt a shared `matchKey` instead of
// its default `${source}:${sourceId}` key, so it merges with the same
// physical project ingested from another source.
//
// File format (see manualOverrides.example.csv):
//   source,sourceId,matchKey
//   eia,6121-1,grain-belt-express-phase-1
//   permittingDashboard,71536,grain-belt-express-phase-1
//
// This is intentionally a human-curated file, not a fuzzy-matching
// algorithm — project identity claims ("these two records are the same
// physical thing") are exactly the kind of claim that should have a name
// attached, not a similarity score.

import { readFileSync, existsSync } from "node:fs";
import path from "node:path";

export interface ManualOverrideRow {
  source: string;
  sourceId: string;
  matchKey: string;
}

const OVERRIDES_PATH = path.join(process.cwd(), "src/lib/ingest/manualOverrides.csv");

let cache: ManualOverrideRow[] | null = null;

export function loadManualOverrides(): ManualOverrideRow[] {
  if (cache) return cache;
  if (!existsSync(OVERRIDES_PATH)) {
    cache = [];
    return cache;
  }
  const raw = readFileSync(OVERRIDES_PATH, "utf-8");
  const lines = raw.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const [, ...rows] = lines; // skip header
  cache = rows.map((line) => {
    const [source, sourceId, matchKey] = line.split(",").map((s) => s.trim());
    return { source, sourceId, matchKey };
  });
  return cache;
}

export function resolveMatchKey(source: string, sourceId: string): string {
  const override = loadManualOverrides().find(
    (o) => o.source === source && o.sourceId === sourceId,
  );
  return override ? override.matchKey : `${source}:${sourceId}`;
}
