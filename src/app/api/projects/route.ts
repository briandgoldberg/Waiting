import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { serializeProject } from "@/lib/serialize";
import { matchesFilters, DEFAULT_FILTERS, type FilterState } from "@/lib/filters";

// Public, read-only, no key required — CORS is wide open on purpose so
// external tools/agents can call this directly from the browser or a server.
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

function parseList(value: string | null): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

function parseNumber(value: string | null): number | null {
  if (!value) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

// Query params (all optional, combine with AND, same semantics as the
// on-site filter panel — see src/lib/filters.ts):
//   state           USPS code, e.g. "CA"
//   fuelType        comma-separated, e.g. "solar,wind_onshore"
//   projectType     comma-separated, e.g. "generation,storage"
//   stage           comma-separated currentStage values
//   minYearsWaiting number
//   minCapacity     number, MW
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const filters: FilterState = {
    ...DEFAULT_FILTERS,
    state: searchParams.get("state") || null,
    fuelTypes: parseList(searchParams.get("fuelType")) as FilterState["fuelTypes"],
    projectTypes: parseList(searchParams.get("projectType")) as FilterState["projectTypes"],
    stages: parseList(searchParams.get("stage")) as FilterState["stages"],
    minYearsWaiting: parseNumber(searchParams.get("minYearsWaiting")),
    minCapacity: parseNumber(searchParams.get("minCapacity")),
  };

  const projects = await prisma.project.findMany({
    include: { causes: true, sources: true, milestones: true },
    orderBy: { createdAt: "asc" },
  });

  const filtered = projects.map(serializeProject).filter((p) => matchesFilters(p, filters));

  return NextResponse.json(filtered, { headers: CORS_HEADERS });
}

export async function OPTIONS() {
  return new NextResponse(null, { headers: CORS_HEADERS });
}
