# Ingestion modules

One module per data source, each normalizing into the shared
`NormalizedProject` shape (`common.ts`) and upserting into the Prisma
schema. This project deliberately sticks to **updatable data sources** —
no hand-curated one-off research (an earlier version of this project
shipped a small hand-researched seed set; it was removed in favor of
sources that can be re-run and stay current on their own).

| Module | Source | Live API? | Auth needed | Scheduled? |
|---|---|---|---|---|
| `eia860mPlanned.ts` | EIA-860M "Planned" generator inventory | Yes — monthly Excel workbook, auto-discovered | Free API key not required for this module (see `eia.ts` below for the one that does) | Cron every 3 days (13:00 UTC), `/api/cron/ingest-eia` |
| `permittingDashboard.ts` | Federal Permitting Dashboard (FAST-41) | Yes — public Socrata endpoint | None found needed | Cron every 3 days (14:00 UTC), `/api/cron/ingest-permitting-dashboard` |
| `lbnlQueuedUp.ts` | LBNL Queued Up | Yes — annual Excel workbook, scraped off the landing page | None (no auth, just a browser-like User-Agent — see file header) | Cron every 3 days (15:00 UTC), `/api/cron/ingest-lbnl`, even though LBNL itself only republishes ~annually — see file header for why checking this often still makes sense |
| `ornlHydropowerRelicensing.ts` | ORNL HydroSource hydropower relicensing/license-surrender dataset | Yes — annual Excel workbook, edition-year page auto-discovered then scraped, same two-step pattern as LBNL | None (no auth, just a browser-like User-Agent) | Cron every 3 days (16:00 UTC), `/api/cron/ingest-ornl-hydro`, same "cheap periodic check of an annual source" rationale as LBNL |
| `eiaPipelineProjects.ts` | EIA "Natural Gas Pipeline Projects" tracker | Yes — quarterly Excel workbook, scraped off the landing page (naming convention itself isn't consistent — see file header) | None (no auth) | Cron every 3 days (17:00 UTC), `/api/cron/ingest-eia-pipelines` |
| `eia.ts` | EIA API v2 `operating-generator-capacity` | Yes | Free API key | **Superseded, do not run** — see file header. This route only covers already-operating plants; `eia860mPlanned.ts` replaced it. |

All five scheduled sources run via Vercel Cron (see `vercel.json`) with no
manual step required — checking every 3 days bounds this site's staleness
to ~3 days behind whatever each source most recently published, it doesn't
mean the source itself changes that often (EIA-860M republishes monthly, the
EIA pipeline tracker ~quarterly, LBNL and ORNL annually; only the Permitting
Dashboard's live API is closer to real-time). Every ingestion run upserts by
a stable per-source ID, so re-running a source updates existing projects in place
rather than duplicating them.

Run a module directly with `npx tsx src/lib/ingest/<module>.ts` (or the
`npm run ingest:eia` / `npm run ingest:permitting-dashboard` / `npm run
ingest:lbnl` / `npm run ingest:ornl-hydro` / `npm run
ingest:eia-pipelines` scripts) for a manual run outside the cron schedule.

## RESOLVED_STAGES: what never appears on the site

This site tracks projects still waiting on a regulatory yes — a project
that's already been approved and is awaiting construction, is under
construction, was cancelled/withdrawn, or is already operating/completed
is excluded entirely, not just deprioritized. Enforced in one place
(`upsertNormalizedProject`, `common.ts`) rather than per-module: any
`NormalizedProject` whose `currentStage` is one of `RESOLVED_STAGES`
(`src/lib/data/taxonomies.ts`) gets deleted (if it previously existed) and
is never created. `eia860mPlanned.ts`, `permittingDashboard.ts`, and
`eiaPipelineProjects.ts` all normalize *every* row — including
already-approved/cancelled/operating ones — and let this shared guard
decide, specifically so a project this site previously tracked as waiting
gets removed the moment a source reports it's moved on, rather than
freezing in a stale "still waiting" state forever. `lbnlQueuedUp.ts` and
`ornlHydropowerRelicensing.ts` still filter these rows out *before*
normalizing (see open question #9) — a narrower, currently-safe gap, not
the same guarantee.

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
4. **Permitting Dashboard, EIA-860M, ORNL hydropower relicensing & EIA's
   pipeline tracker: no cause-category field.** None of the four tells you
   *why* a project is delayed in terms of this site's seven categories. All
   four modules ship every ingested project with `causeSlugs: []` and a
   note that it needs manual/derived assignment — deliberately, rather
   than guessing a plausible-sounding default.
5. **EIA-860M has no application-filed date either** — only a planned
   in-service date — so "days/years waiting" can't be computed for
   EIA-sourced projects without a manual override.
6. **LBNL Queued Up and ORNL hydropower relicensing column names are
   unverified against a future downloaded workbook.** Both parsers were
   written from familiarity with past/current editions of their respective
   codebooks and fail loudly (naming the missing column) rather than
   silently misreading a shifted one. Check each workbook's own
   codebook/field-descriptions tab before relying on either after a new
   annual edition ships.
7. **Redistribution terms aren't fully confirmed for any source.** Federal
   (.gov) data is generally public domain under 17 U.S.C. §105, consistent
   with default federal open-data licensing norms, but no dataset-specific
   terms page was found for `data.permits.performance.gov` or the EIA API;
   LBNL's Queued Up dataset asks for citation in a way that reads like an
   academic norm, not a formal license; and ORNL HydroSource's Data Use
   Policy wasn't independently confirmed as a formal redistribution
   license either. Get an explicit answer per source before redistributing
   bulk data via this site's own API at scale.
8. **ORNL hydropower relicensing skews far smaller than this site's other
   sources.** Only 17 of the 200 currently-waiting relicensing dockets
   clear the 250 MW floor (as of the 2026 edition) — most FERC-licensed
   hydro projects are small municipal or private dams. That's expected,
   not a bug, but it means this source contributes a much thinner slice of
   real projects than EIA-860M or LBNL Queued Up do.
9. **LBNL Queued Up and ORNL hydropower relicensing don't get the full
   RESOLVED_STAGES cleanup guarantee the other two sources do** (see
   "RESOLVED_STAGES" above). Both still filter out already-cleared rows
   (withdrawn/operational/suspended queue entries; IA-executed/pending/
   under-construction phases; issued relicenses; exemption conversions)
   *before* ever calling `normalize*Row`, rather than normalizing them with
   their real terminal stage and letting the shared guard delete a stale
   row. Practically: if a project either module previously tracked as
   waiting later shows up in a new annual edition with a cleared status,
   it will keep displaying on the site in its last-known waiting state
   until someone notices and fixes this — audited 2026-08-16 and confirmed
   zero rows from either source are currently in that stale state, but the
   gap is real for whenever the next annual edition ships. Bringing both in
   line with `eia860mPlanned.ts` / `permittingDashboard.ts` (normalize
   every row, let `common.ts` decide) is the follow-up.
10. **EIA's pipeline projects tracker's filename convention isn't
    consistent** — confirmed 2026-08-16, most historical archive links use
    `EIA-NaturalGasPipelineProjects_<Mon><YYYY>.xlsx` (leading underscore,
    inconsistent month abbreviations across editions) but the current live
    one is `EIA-NaturalGasPipelineProjectsAug2026.xlsx` (no underscore).
    `eiaPipelineProjects.ts` scrapes the landing page for the current link
    rather than guessing a filename, so this shouldn't break ingestion, but
    it means a predictable-URL approach (like `eia860mPlanned.ts` uses)
    isn't viable for this source. Also has no capacity floor and no
    lat/lon (pipelines span multiple states) — both explicit product
    decisions, see the file header for the reasoning.
