import type { AggregateStats } from "@/lib/types";
import type { ProjectDTO } from "@/lib/types";

// Aggregate stats deliberately exclude `isAggregateExample` projects (like
// the PJM regional aggregate in the seed set) — mixing a regional aggregate
// into a sum of individual projects would double-count and overstate the
// total. See prisma/seed.ts for why that entry exists at all.
export function computeAggregateStats(projects: ProjectDTO[]): AggregateStats {
  const realProjects = projects.filter((p) => !p.isAggregateExample);

  const totalCapacityMw = realProjects.reduce((sum, p) => {
    if (p.capacityUnit !== "MW" || p.capacityValue == null) return sum;
    return sum + p.capacityValue;
  }, 0);

  const totalProjectYears = realProjects.reduce((sum, p) => sum + (p.yearsWaiting ?? 0), 0);

  let totalCostOfDelayUsd = 0;
  let costOfDelayCoverageCount = 0;
  for (const p of realProjects) {
    if (p.costOfDelay.applicable && p.costOfDelay.estimatedUsd != null) {
      totalCostOfDelayUsd += p.costOfDelay.estimatedUsd;
      costOfDelayCoverageCount += 1;
    }
  }

  return {
    totalProjects: realProjects.length,
    totalCapacityMw,
    totalProjectYears,
    totalCostOfDelayUsd,
    costOfDelayCoverageCount,
  };
}
