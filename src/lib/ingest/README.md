# Ingestion modules

One module per data source, each normalizing into the shared
`NormalizedProject` shape (`common.ts`) and upserting into the Prisma
schema. This project deliberately sticks to **updatable data sources** —
no hand-curated one-off research (an earlier version of this project
shipped a small hand-researched seed set; it was removed in favor of
sources that can be re-run and stay current on their own).

| Module | Source | Live API? | Auth needed | Scheduled? |
|---|---|---|---|---|
| `eia860mPlanned.ts` | EIA-860M "Planned" generator inventory | Yes — monthly Excel workbook, auto-discovered | Free API key not required for this module (see `eia.ts` below for the one that does) | Daily cron, `/api/cron/ingest-eia` |
| `permittingDashboard.ts` | Federal Permitting Dashboard (FAST-41) | Yes — public Socrata endpoint | None found needed | Daily cron, `/api/cron/ingest-permitting-dashboard` |
| `lbnlQueuedUp.ts` | LBNL Queued Up | No — annual Excel download | None (manual download) | Not yet — no cron, needs a human to fetch the file each year |
| `eia.ts` | EIA API v2 `operating-generator-capacity` | Yes | Free API key | **Superseded, do not run** — see file header. This route only covers already-operating plants; `eia860mPlanned.ts` replaced it. |

Run a module directly with `npx tsx src/lib/ingest/<module>.ts` (or the
`npm run ingest:eia` / `npm run ingest:permitting-dashboard` scripts) for a
manual run outside the cron schedule.

## Open questions (flagged, not guessed at)

These are called out here — and inline in each module — instead of being
silently assumed, per this project's own positioning: a site whose core
argument rests on data credibility shouldn't paper over gaps in that data.

1. **Cross-source project identity matching is a real, ongoing problem,
   not fully solved.** EIA and the Permitting Dashboard use their own
   name/ID for what might be the same physical project. Three confirmed
   duplicates (Grain Belt Express, SouthCoast Wind, Ocean Wind 1) were
   found and fixed by hand after the Permitting Dashboard's first live run
   — see `KNOWN_DUPLICATE_PROJECT_IDS` in `permittingDashboard.ts`. There's
   also a `manualOverrides.ts` + `.csv` path for declaring two source
   records the same project via a shared `matchKey`, for future cases
   where both sides go through the ingestion pipeline (as opposed to one
   side being the special-cased skip list above). No automated fuzzy
   matching is attempted — building real matching (name similarity +
   geographic proximity + capacity similarity) is the single highest-value
   follow-up engineering task.
2. **Permitting Dashboard's Socrata dataset is a denormalized join, not
   one row per project** — a query can return dozens of byte-for-byte
   duplicate rows per project_id. `permittingDashboard.ts` dedupes before
   normalizing; if this ever silently regresses, the symptom is way more
   projects than expected from a single ingestion run.
3. **Permitting Dashboard: no milestone/timeline or application-filed-date
   field found** on the public Socrata dataset used
   (`fh3k-bqsc` / "FAST-41 Projects Data"). The dashboard clearly has this
   data — it's the whole point of the site's timeline feature — but it's
   likely behind the token-gated `/api/v1/project/{id}` endpoint mentioned
   in the dashboard's own docs, which hasn't been registered for.
4. **Permitting Dashboard & EIA-860M: no cause-category field.** Neither
   source tells you *why* a project is delayed in terms of this site's
   seven categories. Both modules ship every ingested project with
   `causeSlugs: []` and a note that it needs manual/derived assignment —
   deliberately, rather than guessing a plausible-sounding default.
5. **EIA-860M has no application-filed date either** — only a planned
   in-service date — so "days/years waiting" can't be computed for
   EIA-sourced projects without a manual override.
6. **LBNL Queued Up column names are unverified against a real downloaded
   workbook.** The parser was written from familiarity with past editions
   of the codebook and fails loudly (naming the missing column) rather than
   silently misreading a shifted one. Check the current workbook's own
   codebook tab before relying on it.
7. **Redistribution terms aren't fully confirmed for any source.** Federal
   (.gov) data is generally public domain under 17 U.S.C. §105, consistent
   with default federal open-data licensing norms, but no dataset-specific
   terms page was found for `data.permits.performance.gov` or the EIA API,
   and LBNL's Queued Up dataset asks for citation in a way that reads like
   an academic norm, not a formal license. Get an explicit answer per
   source before redistributing bulk data via this site's own API at
   scale.
