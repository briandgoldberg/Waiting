// Cost-of-delay estimate — the site's most persuasive (and most scrutinized)
// number, so the formula and every assumption live in one place, in plain
// code, and are rendered verbatim on /methodology. Nothing here is fabricated
// precision: where a project type doesn't fit the formula, we return `null`
// and say so, rather than inventing a number.
//
// METHOD (generation & storage projects only, v1):
//   estimated value of undelivered energy
//     = capacity (MW)
//     × typical capacity factor for that fuel/technology
//     × 24 (hours/day)
//     × days waiting
//     × assumed wholesale power price ($/MWh)
//
// This approximates the market value of the electricity the project would
// have generated and sold, had it been online for the delay period, at a
// blended national wholesale price. It is a proxy, not a project-specific
// revenue forecast — real capacity factors, market prices, and curtailment
// vary a lot by location and hour. Treat it as an order-of-magnitude
// "value left on the table," not a precise cost.
//
// Transmission, pipeline, and LNG projects are NOT run through this formula
// in v1 — "MW of undelivered generation" isn't the right unit for a wire or
// a pipe, and we did not want to invent a congestion-cost or
// throughput-value proxy without being able to defend its assumptions the
// same way. Their cost-of-delay is shown as "not estimated in v1" (see
// README open questions).

import type { FuelType } from "@/lib/data/taxonomies";

// Rough, published typical U.S. capacity factors by technology (EIA-reported
// fleet averages, recent years). These are national averages, not
// project-specific or site-specific figures.
export const CAPACITY_FACTOR_BY_FUEL: Partial<Record<FuelType, number>> = {
  solar: 0.24,
  wind_onshore: 0.35,
  wind_offshore: 0.45,
  gas: 0.55,
  nuclear: 0.92,
  hydro: 0.4,
  geothermal: 0.75,
};

// A single blended national wholesale power price assumption, in $/MWh.
// Recent (2023-2025) day-ahead wholesale hub prices across major U.S.
// markets have mostly ranged roughly $25-$45/MWh outside price spikes; $35
// is a round midpoint. This is intentionally a single flat assumption for
// v1 rather than region/hour-specific pricing — a known simplification,
// called out on the methodology page.
export const ASSUMED_WHOLESALE_PRICE_USD_PER_MWH = 35;

export interface CostOfDelayInput {
  fuelType: string;
  capacityValue: number | null;
  capacityUnit: string | null;
  daysWaiting: number | null;
}

export interface CostOfDelayResult {
  applicable: boolean;
  reason?: string;
  estimatedMwhUndelivered?: number;
  estimatedUsd?: number;
  capacityFactor?: number;
}

export function daysWaiting(applicationFiledDate: Date | string | null): number | null {
  if (!applicationFiledDate) return null;
  const filed = new Date(applicationFiledDate);
  if (Number.isNaN(filed.getTime())) return null;
  const ms = Date.now() - filed.getTime();
  return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)));
}

export function yearsWaiting(applicationFiledDate: Date | string | null): number | null {
  const days = daysWaiting(applicationFiledDate);
  return days == null ? null : days / 365.25;
}

export function estimateCostOfDelay(input: CostOfDelayInput): CostOfDelayResult {
  const { fuelType, capacityValue, capacityUnit, daysWaiting: days } = input;

  if (capacityUnit !== "MW") {
    return {
      applicable: false,
      reason:
        "Cost-of-delay is only estimated for projects with capacity measured in MW (generation/storage). This project's capacity is measured differently (e.g. MTPA, or pipeline length/diameter).",
    };
  }

  const capacityFactor = CAPACITY_FACTOR_BY_FUEL[fuelType as FuelType];
  if (capacityFactor == null) {
    return {
      applicable: false,
      reason: `No published typical capacity factor is used for fuel type "${fuelType}" in v1, so no dollar estimate is shown for it.`,
    };
  }

  if (capacityValue == null || days == null) {
    return {
      applicable: false,
      reason: "Missing capacity or filing-date data needed to compute an estimate.",
    };
  }

  const estimatedMwhUndelivered = capacityValue * capacityFactor * 24 * days;
  const estimatedUsd = estimatedMwhUndelivered * ASSUMED_WHOLESALE_PRICE_USD_PER_MWH;

  return {
    applicable: true,
    estimatedMwhUndelivered,
    estimatedUsd,
    capacityFactor,
  };
}

export function formatUsd(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
}
