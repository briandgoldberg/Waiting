# WaitingForPower — an Energy Project Tracker

Open source, MIT licensed — see [`LICENSE`](LICENSE). Contributions,
forks, and issues welcome.

Tracks proposed U.S. energy projects — generation, transmission, storage,
LNG, and pipelines, every fuel type — and how long each has been waiting for
approval, and why.

**The argument is structural, not partisan:** solar, wind, storage, gas,
nuclear, hydro, LNG, pipelines, and transmission all get stuck in the same
handful of bottlenecks. Every tracked delay is mapped to one of seven named
cause categories ([`src/lib/data/causeCategories.ts`](src/lib/data/causeCategories.ts)).
The site's policy argument — six specific, bipartisan reform proposals, one
per structural bottleneck, each with a stated problem, proposal, strengths,
weaknesses, and bill links — lives on a single page,
[`/policies`](src/app/policies/page.tsx)
([`src/lib/data/policies.ts`](src/lib/data/policies.ts)), deliberately kept
separate from the neutral cause-category data so "why a project is stuck"
and "what we're arguing should change" aren't the same object.

## Quick start

```bash
npm install
cp .env.example .env      # set DATABASE_URL to your own Postgres instance
npx prisma migrate deploy # applies the committed migrations to your database
npm run ingest:permitting-dashboard  # populate from a live, no-key-needed source
npm run dev
```

Needs a real Postgres connection string in `DATABASE_URL` — there's no
bundled local database file. The deployed app and local dev both point at
the same hosted Postgres instance for this project (see "Architecture"
below for why); for your own fork, any Postgres works (Neon, Supabase,
Vercel/Prisma Postgres, RDS, local `postgres` via Docker, etc.).

## Data & sourcing

**All project data comes from live, re-runnable sources — no hand-curated
one-off research.** An earlier version of this project shipped a small
hand-researched seed set; it was removed deliberately in favor of sources
that stay current on their own, rather than a snapshot that goes stale.
See [`src/lib/ingest/README.md`](src/lib/ingest/README.md) for the full
per-source table, open questions, and how each is scheduled:

| Source | Module | Scheduled? |
|---|---|---|
| EIA-860M "Planned" generator inventory | `src/lib/ingest/eia860mPlanned.ts` | Daily cron, `/api/cron/ingest-eia` |
| Federal Permitting Dashboard (FAST-41) | `src/lib/ingest/permittingDashboard.ts` | Daily cron, `/api/cron/ingest-permitting-dashboard` |
| LBNL Queued Up | `src/lib/ingest/lbnlQueuedUp.ts` | Not yet — needs a manually-downloaded annual file |

Every ingested project links back to its public source (see each project's
detail page). Where a date or figure wasn't confidently available, the
project is marked `dateConfidence: "approximate"` or carries a
`dataQualityNote` saying so, rather than presenting invented precision as
fact. Notably absent so far: individual LBNL interconnection-queue
projects, hydropower relicensing detail, and any cause-category assignment
for automatically-ingested projects (neither EIA nor the Permitting
Dashboard publishes *why* a project is delayed — see open question #4).

## Open questions

Flagged deliberately rather than guessed at — see also
[`src/lib/ingest/README.md`](src/lib/ingest/README.md) for the
per-data-source version of this list.

1. **Cross-source project identity matching is a real, ongoing problem,
   not fully solved.** EIA and the Permitting Dashboard use their own
   name/ID for what might be the same physical project. Three confirmed
   duplicates (Grain Belt Express, SouthCoast Wind, Ocean Wind 1) were
   caught and fixed by hand after the Permitting Dashboard's first live
   run — see `KNOWN_DUPLICATE_PROJECT_IDS` in `permittingDashboard.ts`.
   `src/lib/ingest/manualOverrides.ts` + `.csv` exists for a human to
   declare two source records the same project via a shared `matchKey`,
   but there's no automated fuzzy-matching. Building real matching (name
   similarity + geographic proximity + capacity similarity) is the
   highest-value follow-up engineering task.
2. **Permitting Dashboard's Socrata dataset is a denormalized join, not
   one row per project** — a single query can return dozens of
   byte-for-byte duplicate rows per project. The ingestion module dedupes
   before normalizing; watch for this if the row count from a fresh run
   ever looks far higher than expected.
3. **Permitting Dashboard has no public milestone/timeline or
   application-filed-date field** on the open Socrata dataset this project
   used — that data likely exists behind the token-gated
   `/api/v1/project/{id}` endpoint mentioned in the dashboard's own docs,
   which wasn't registered for in this pass.
4. **EIA and the Permitting Dashboard don't publish a cause category.**
   Every project ingested from either source ships with `causeSlugs: []`
   and an explicit note that it needs manual/derived assignment, rather
   than a guessed default.
5. **LBNL Queued Up column names are unverified against a real downloaded
   workbook** — the parser was written from familiarity with past editions
   of the codebook and fails loudly (naming the missing column) rather than
   silently misreading a shifted one. Check the current workbook's own
   codebook tab before relying on it.
6. **Redistribution terms aren't fully confirmed for any source.** Federal
   (.gov) data is generally public domain under 17 U.S.C. §105, consistent
   with default federal open-data licensing norms, but no dataset-specific
   terms page was found for `data.permits.performance.gov` or the EIA API,
   and LBNL's Queued Up asks for citation in a way that reads like an
   academic norm, not a formal license. Get an explicit answer per source
   before redistributing bulk data via this site's own API at scale.
7. **Investment-waiting only covers generation/storage projects with MW
   capacity and a published construction-cost figure.** Transmission,
   pipeline, and LNG projects show "not estimated" rather than a number
   built on assumptions this project couldn't defend as well — see
   `src/lib/calc/investmentWaiting.ts` and `/methodology`.
8. **SQLite + serverless deployment (resolved).** v1 originally shipped
   with a committed SQLite file for zero-config local dev. On the first
   Vercel deploy this broke completely: Next.js's serverless file tracer
   doesn't know to bundle a file that's only referenced via a connection
   string (not `import`ed), so `prisma/dev.db` was silently missing from
   the deployed function and every DB read 500'd — a strictly worse
   failure mode than the "writes won't persist" issue originally flagged
   here. Fixed by moving to a hosted Postgres instance (Prisma Postgres via
   Vercel's Storage integration) used by both local dev and production.

## Architecture

- **Next.js (App Router) + TypeScript + Tailwind v4**, single app.
- **Prisma + Postgres** (`prisma/schema.prisma`) — one hosted instance used
  for both local dev and production; see open question #7 for why this
  project moved off SQLite.
- **MapLibre GL JS** for the map — a free CARTO Voyager vector basemap (no
  API token required), with projects rendered as plain DOM markers
  (`maplibregl.Marker`) sized by capacity, colored uniformly. An earlier
  version used a clustered GeoJSON source rendered as GL circle layers, but
  that pipeline (worker-built tiles + GL repaint) wasn't reliably rendering
  in production; DOM markers sidestep it entirely at the cost of native
  clustering — see git history on `src/components/Map.tsx`.
- Filters live as React state in `src/components/Explorer.tsx` and drive
  both the map and the sortable list/table view from one source of truth
  (`src/lib/filters.ts`), with live-updating aggregate stats
  (`src/lib/stats.ts`).

## Project schema

See `prisma/schema.prisma` for the authoritative version. Key point: cause
categories (and the policies argued for at `/policies`) are **not** a
database table — they're fixed, small, code-reviewed sets in
`src/lib/data/causeCategories.ts` and `src/lib/data/policies.ts`. Projects
reference a cause by string slug, validated in app code, not a DB foreign
key — adding a new cause category or policy is meant to be a deliberate
product/policy decision, not something an ingestion script can do silently.
