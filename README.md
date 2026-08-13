# Waiting — an Energy Project Tracker

Tracks proposed U.S. energy projects — generation, transmission, storage,
LNG, and pipelines, every fuel type — and how long each has been waiting for
approval, and why.

**The argument is structural, not partisan:** solar, wind, storage, gas,
nuclear, hydro, LNG, pipelines, and transmission all get stuck in the same
handful of bottlenecks. Every tracked delay is mapped to one of seven named
cause categories, and every cause category is paired with a specific,
named permitting-reform proposal that targets it — see
[`src/lib/data/causeCategories.ts`](src/lib/data/causeCategories.ts) and the
in-app `/reform/*` pages.

## Quick start

```bash
npm install
cp .env.example .env      # fill in ADMIN_PASSWORD / ADMIN_SESSION_SECRET at minimum
npx prisma migrate deploy # applies the committed schema to a fresh prisma/dev.db
npx tsx prisma/seed.ts    # loads the v1 curated seed set (see below)
npm run dev
```

The repo ships with `prisma/dev.db` already migrated and seeded, so
`npm install && npm run dev` alone is enough to see real data immediately —
the steps above are for resetting or rebuilding it from scratch.

Visit `/admin` and sign in with `ADMIN_USERNAME` / `ADMIN_PASSWORD` from
`.env` to review submissions (see "User submissions" below).

## Data & sourcing

**v1's seed data (`prisma/seed.ts`) is a small, hand-researched set of 10
real, individually-cited projects** spanning every project type and fuel
type — not a live pull from the automated ingestion pipeline. That pipeline
(`src/lib/ingest/`) is real, working code, verified against live API
responses while building it, but running it end-to-end needs credentials
and a manually-downloaded file this environment didn't have:

| Source | Module | What it needs to actually run |
|---|---|---|
| EIA-860/860M (EIA API v2) | `src/lib/ingest/eia.ts` | Free `EIA_API_KEY` |
| Federal Permitting Dashboard | `src/lib/ingest/permittingDashboard.ts` | Nothing — public Socrata endpoint |
| LBNL Queued Up | `src/lib/ingest/lbnlQueuedUp.ts` | The current year's Excel workbook, downloaded by hand from emp.lbl.gov/queues |
| FERC eLibrary | `src/lib/ingest/fercSeed.ts` | Hand curation only — see why below |

Every seeded project links to the public reporting or primary source
checked while building it (FERC/BOEM/EPA dockets, court rulings, trade
press) — see each project's detail page. Where a date or figure wasn't
confidently pinned to the day or exact number, the project is marked
`dateConfidence: "approximate"` or carries a `dataQualityNote` saying so,
rather than presenting invented precision as fact. This is a **launch set,
not a comprehensive database** — notably absent: individual LBNL
interconnection-queue projects (one aggregate PJM entry stands in for the
category, clearly labeled as an aggregate — see below), hydropower
relicensing, onshore wind, and standalone gas plants.

### The PJM aggregate entry

One seeded entry, "PJM Interconnection Queue — Regional Aggregate," is
**not a single physical project** — it's PJM's own reported queue-wide
statistics, included so the interconnection-queue-backlog cause category
has a real, cited data point pending full ingestion of LBNL's
project-level dataset. It's flagged `isAggregateExample: true`, shown with
a visible label everywhere it appears, and **excluded from all aggregate
headline stats** (total capacity, project-years, cost of delay) to avoid
double-counting against individual projects. See
[`/methodology`](src/app/methodology/page.tsx) in the running app.

## Open questions

Flagged deliberately rather than guessed at — see also
[`src/lib/ingest/README.md`](src/lib/ingest/README.md) for the
per-data-source version of this list.

1. **Cross-source project identity matching is unsolved.** EIA, the
   Permitting Dashboard, and LBNL each use their own name/ID for what might
   be the same physical project. v1 ships a manual-override path
   (`src/lib/ingest/manualOverrides.ts` + `.csv`) for a human to declare two
   source records are the same project, but no automated fuzzy-matching.
   Building real matching (name similarity + geographic proximity +
   capacity similarity) is the highest-value follow-up engineering task.
2. **Permitting Dashboard has no public milestone/timeline or
   application-filed-date field** on the open Socrata dataset this project
   used — that data likely exists behind the token-gated
   `/api/v1/project/{id}` endpoint mentioned in the dashboard's own docs,
   which wasn't registered for in this pass.
3. **EIA and the Permitting Dashboard don't publish a cause category.**
   Every project ingested from either source ships with `causeSlugs: []`
   and an explicit note that it needs manual/derived assignment, rather
   than a guessed default.
4. **LBNL Queued Up column names are unverified against a real downloaded
   workbook** — the parser was written from familiarity with past editions
   of the codebook and fails loudly (naming the missing column) rather than
   silently misreading a shifted one. Check the current workbook's own
   codebook tab before relying on it.
5. **FERC eLibrary has no public API**, and this project didn't check
   elibrary.ferc.gov's robots.txt/terms of use for whether scraping search
   results would be permitted — so it isn't scraped. All FERC-sourced
   projects here are hand-curated with individually-checked citations.
6. **Redistribution terms aren't fully confirmed for any source.** Federal
   (.gov) data is generally public domain under 17 U.S.C. §105, consistent
   with default federal open-data licensing norms, but no dataset-specific
   terms page was found for `data.permits.performance.gov` or the EIA API,
   and LBNL's Queued Up asks for citation in a way that reads like an
   academic norm, not a formal license. Get an explicit answer per source
   before redistributing bulk data via this site's own API at scale.
7. **Cost-of-delay only covers generation/storage projects with MW
   capacity and a published capacity factor.** Transmission, pipeline, and
   LNG projects show "not estimated" rather than a number built on
   assumptions this project couldn't defend as well — see
   `src/lib/calc/costOfDelay.ts` and `/methodology`.
8. **SQLite + serverless deployment.** v1 uses SQLite for zero-config local
   dev. Vercel's serverless filesystem is read-only outside `/tmp`, so
   submissions and admin approvals will not persist if this is deployed
   there as-is — swap `DATABASE_URL` to a hosted Postgres instance and
   change the Prisma `provider` before deploying anywhere with
   ephemeral/read-only disk. See `.env.example`.

## Architecture

- **Next.js (App Router) + TypeScript + Tailwind v4**, single app.
- **Prisma + SQLite** (`prisma/schema.prisma`) — swappable to Postgres, see
  open question #8.
- **MapLibre GL JS** for the map — a free CARTO Voyager vector basemap (no
  API token required), custom circle-layer markers sized by capacity and
  colored by primary cause category, with native GeoJSON clustering.
- Filters live as React state in `src/components/Explorer.tsx` and drive
  both the map and the sortable list/table view from one source of truth
  (`src/lib/filters.ts`), with live-updating aggregate stats
  (`src/lib/stats.ts`).
- **Admin auth** is a single shared login (`ADMIN_USERNAME`/`ADMIN_PASSWORD`
  env vars) with an HMAC-signed session cookie — no user-account system, per
  the v1 spec. See `src/lib/admin/auth.ts`.
- User submissions never auto-publish: `POST /api/submissions` writes to a
  `Submission` table with `status: "pending"`; only an authenticated admin
  approving via `/admin` copies it into a real `Project` row (as
  `verificationStatus: "user_submitted_verified"`).

## Project schema

See `prisma/schema.prisma` for the authoritative version. Key point: cause
categories and their paired reform levers are **not** a database table —
they're a fixed, small, code-reviewed set in
`src/lib/data/causeCategories.ts`. Projects reference a cause by string
slug, validated in app code, not a DB foreign key — adding a new cause
category is meant to be a deliberate product/policy decision, not something
an ingestion script can do silently.
