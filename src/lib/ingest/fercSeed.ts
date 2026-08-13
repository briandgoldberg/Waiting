// FERC eLibrary manual seed — LNG and hydropower licensing/relicensing
// dockets, and litigation status, curated by hand rather than ingested
// automatically.
//
// WHY MANUAL, NOT SCRAPED: FERC eLibrary (elibrary.ferc.gov) has no public
// API. It's a docket search/document system, not a structured open-data
// feed. We could technically scrape its search results, but:
//   1. We did not check elibrary.ferc.gov's robots.txt or terms of use in
//      this pass, and building an automated scraper against a court/docket
//      -style system without confirming that's allowed is exactly the kind
//      of thing this project should flag rather than just do. Treat "is
//      scraping eLibrary permitted" as an open question — see README.
//   2. The project brief itself says to use FERC eLibrary "selectively...
//      don't build core ingestion pipeline around it" — it's meant to seed
//      a handful of high-profile LNG/hydro/transmission projects, not to be
//      a bulk source.
//
// So: this file is a typed, hand-maintained list (not fetched from
// anywhere at runtime) of individually-researched projects, each with real
// citation links a human checked. To add one, follow the FercSeedProject
// shape below and cite your source — do not invent docket numbers, dates,
// or figures.
//
// This module intentionally has NO data in it by default — the actual
// curated LNG/hydro/offshore-wind/pipeline/nuclear projects for this
// project's v1 seed set live in prisma/seed.ts, researched directly for
// that purpose (see README "Data & sourcing" for how each one was
// verified). This file exists as the reusable *shape and loader* future
// contributors should use to hand-add more FERC-docketed projects without
// touching prisma/seed.ts's core cast, plus an example.

import { resolveMatchKey } from "@/lib/ingest/manualOverrides";
import { upsertNormalizedProject, type NormalizedProject } from "@/lib/ingest/common";

export type FercSeedProject = Omit<NormalizedProject, "matchKey" | "externalIds"> & {
  fercDocketNumber: string;
};

export const FERC_SEED_PROJECTS: FercSeedProject[] = [
  // Example — replace with a real, individually-verified entry and remove
  // this comment. Every field must trace to a real citation in `sources`.
  //
  // {
  //   fercDocketNumber: "CP19-XXX",
  //   name: "Example LNG Terminal",
  //   projectType: "lng",
  //   fuelType: "lng",
  //   state: "TX",
  //   capacityValue: 10,
  //   capacityUnit: "MTPA",
  //   applicationFiledDate: new Date("2019-01-01"),
  //   currentStatus: "Example status — replace with real, cited status",
  //   currentStage: "agency_permitting",
  //   causeSlugs: ["multi_agency_permitting"],
  //   causeDetail: "Replace with a real, cited explanation.",
  //   sources: [{ label: "FERC eLibrary docket CP19-XXX", url: "https://elibrary.ferc.gov/eLibrary/search" }],
  // },
];

export async function ingestFercSeed() {
  let count = 0;
  for (const p of FERC_SEED_PROJECTS) {
    const matchKey = resolveMatchKey("ferc", p.fercDocketNumber);
    await upsertNormalizedProject({
      ...p,
      matchKey,
      externalIds: { ferc: p.fercDocketNumber },
    });
    count += 1;
  }
  console.log(`FERC manual seed ingestion complete: upserted ${count} projects.`);
}

if (require.main === module) {
  ingestFercSeed().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
