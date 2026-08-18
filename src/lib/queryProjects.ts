// Shared project-query logic used by both the public REST API
// (src/app/api/projects/route.ts) and the MCP server (src/app/mcp/route.ts),
// so a filter behaves identically no matter which surface an agent uses to
// call it.

import { prisma } from "@/lib/db";
import { serializeProject } from "@/lib/serialize";
import { matchesFilters, DEFAULT_FILTERS, type FilterState } from "@/lib/filters";
import type { ProjectDTO } from "@/lib/types";

export interface ProjectQuery {
  state?: string | null;
  fuelType?: string[];
  projectType?: string[];
  stage?: string[];
  minYearsWaiting?: number | null;
  minCapacity?: number | null;
}

export function toFilterState(q: ProjectQuery): FilterState {
  return {
    ...DEFAULT_FILTERS,
    state: q.state ?? null,
    fuelTypes: (q.fuelType ?? []) as FilterState["fuelTypes"],
    projectTypes: (q.projectType ?? []) as FilterState["projectTypes"],
    stages: (q.stage ?? []) as FilterState["stages"],
    minYearsWaiting: q.minYearsWaiting ?? null,
    minCapacity: q.minCapacity ?? null,
  };
}

export async function queryProjects(filters: FilterState): Promise<ProjectDTO[]> {
  const projects = await prisma.project.findMany({
    include: { causes: true, sources: true, milestones: true },
    orderBy: { createdAt: "asc" },
  });
  return projects.map(serializeProject).filter((p) => matchesFilters(p, filters));
}

export async function getProjectBySlug(slug: string): Promise<ProjectDTO | null> {
  const project = await prisma.project.findUnique({
    where: { slug },
    include: { causes: true, sources: true, milestones: true },
  });
  return project ? serializeProject(project) : null;
}
