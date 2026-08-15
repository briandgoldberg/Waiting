import type { AggregateStats } from "@/lib/types";
import type { ProjectDTO } from "@/lib/types";
import { ZERO_CARBON_FUELS } from "@/lib/data/taxonomies";

// Aggregate stats deliberately exclude `isAggregateExample` projects —
// e.g. a regional/ISO-wide statistic standing in for many individual
// projects — since mixing one into a sum of individual projects would
// double-count and overstate the total. No source currently ingested
// produces one of these, but the flag and this exclusion stay in place for
// whenever one does (see prisma/schema.prisma for the field's intent).
export function computeAggregateStats(projects: ProjectDTO[]): AggregateStats {
  const realProjects = projects.filter((p) => !p.isAggregateExample);

  const totalCapacityMw = realProjects.reduce((sum, p) => {
    if (p.capacityUnit !== "MW" || p.capacityValue == null) return sum;
    return sum + p.capacityValue;
  }, 0);

  let totalInvestmentWaitingUsd = 0;
  let investmentWaitingCoverageCount = 0;
  for (const p of realProjects) {
    if (p.investmentWaiting.applicable && p.investmentWaiting.estimatedUsd != null) {
      totalInvestmentWaitingUsd += p.investmentWaiting.estimatedUsd;
      investmentWaitingCoverageCount += 1;
    }
  }

  let totalCleanCapacityMw = 0;
  let cleanCapacityProjectCount = 0;
  for (const p of realProjects) {
    if (ZERO_CARBON_FUELS.includes(p.fuelType) && p.capacityUnit === "MW" && p.capacityValue != null) {
      totalCleanCapacityMw += p.capacityValue;
      cleanCapacityProjectCount += 1;
    }
  }

  return {
    totalProjects: realProjects.length,
    totalCapacityMw,
    totalInvestmentWaitingUsd,
    investmentWaitingCoverageCount,
    totalCleanCapacityMw,
    cleanCapacityProjectCount,
  };
}
