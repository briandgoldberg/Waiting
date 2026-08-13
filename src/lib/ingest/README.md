# Ingestion modules

One module per data source, each normalizing into the shared
`NormalizedProject` shape (`common.ts`) and upserting into the Prisma
schema. None of these run automatically — `prisma/seed.ts` uses a small,
hand-researched, individually-cited seed set instead (see the root
README's "Data & sourcing" section for why). Run a module directly with
`npx tsx src/lib/ingest/<module>.ts` once you have real credentials/files.

| Module | Source | Live API? | Auth needed |
|---|---|---|---|
| `eia.ts` | EIA-860/860M via EIA API v2 | Yes | Free API key |
| `permittingDashboard.ts` | Federal Permitting Dashboard | Yes (public Socrata endpoint) | None found needed |
| `lbnlQueuedUp.ts` | LBNL Queued Up | No — annual Excel download | None (manual download) |
| `fercSeed.ts` | FERC eLibrary | No — hand-curated | N/A |

## Open questions (flagged, not guessed at)

These are called out here — and inline in each module — instead of being
silently assumed, per this project's own positioning: a site whose core
argument rests on data credibility shouldn't paper over gaps in that data.

1. **Cross-source project identity matching.** EIA, the Permitting
   Dashboard, and LBNL each use their own name/ID for what might be the
   same physical project. v1 does not attempt automated fuzzy matching —
   see `manualOverrides.ts`. Building real fuzzy-matching (name similarity +
   geographic proximity + capacity similarity, most likely) is the single
   highest-value follow-up piece of engineering work for this project.
2. **Permitting Dashboard: no milestone/timeline or application-filed-date
   field found** on the public Socrata dataset we used
   (`fh3k-bqsc` / "FAST-41 Projects Data"). The dashboard clearly has this
   data — it's the whole point of the site's timeline feature — but it's
   likely behind the token-gated `/api/v1/project/{id}` endpoint mentioned
   in the dashboard's own docs, which we did not register for in this pass.
3. **Permitting Dashboard & EIA: no cause-category field.** Neither source
   tells you *why* a project is delayed in terms of this site's seven
   categories. Both modules ship every ingested project with
   `causeSlugs: []` and a note that it needs manual/derived assignment —
   deliberately, rather than guessing a plausible-sounding default.
4. **LBNL Queued Up column names are unverified.** We wrote the parser
   against column names recalled from familiarity with past editions of the
   codebook, not a downloaded copy of the current workbook (it's a manual
   download, not something fetchable as structured data during
   development). The parser fails loudly — naming the missing field — if a
   column isn't found, rather than silently misreading a shifted column.
   **Before running this for real: open the workbook's own codebook tab and
   check/update `FIELD_CANDIDATES` in `lbnlQueuedUp.ts`.**
5. **FERC eLibrary has no public API.** We did not check
   elibrary.ferc.gov's robots.txt/terms of use for whether scraping search
   results would be permitted, and chose not to build a scraper without
   that answer. All FERC-sourced projects in this repo are hand-curated
   with individually-checked citations instead (see `fercSeed.ts`).
6. **Redistribution terms.** Federal (.gov) data is generally public domain
   under 17 U.S.C. §105, and that's consistent with what we found on
   resources.data.gov about default federal open-data licensing — but we
   did not find a dataset-specific terms page for
   `data.permits.performance.gov` or the EIA API confirming that
   explicitly, and LBNL's Queued Up dataset asks for citation (see
   `lbnlQueuedUp.ts` header) in a way that reads more like an academic
   citation norm than a formal redistribution license. If this project
   grows into something redistributing bulk data via its own public API,
   get an explicit answer on each source's terms before doing that at
   scale.
