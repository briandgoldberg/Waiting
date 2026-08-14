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

  let totalCostOfDelayUsd = 0;
  let costOfDelayCoverageCount = 0;
  for (const p of realProjects) {
    if (p.costOfDelay.applicable && p.costOfDelay.estimatedUsd != null) {
      totalCostOfDelayUsd += p.costOfDelay.estimatedUsd;
      costOfDelayCoverageCount += 1;
    }
  }

  let totalTonnesCo2Avoided = 0;
  let co2AvoidedCoverageCount = 0;
  for (const p of realProjects) {
    if (p.co2Avoided.applicable && p.co2Avoided.estimatedTonnesCo2Avoided != null) {
      totalTonnesCo2Avoided += p.co2Avoided.estimatedTonnesCo2Avoided;
      co2AvoidedCoverageCount += 1;
    }
  }

  return {
    totalProjects: realProjects.length,
    totalCapacityMw,
    totalCostOfDelayUsd,
    costOfDelayCoverageCount,
    totalTonnesCo2Avoided,
    co2AvoidedCoverageCount,
  };
}
