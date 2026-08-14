// CO2-avoided estimate — same treatment as cost-of-delay in
// src/lib/calc/costOfDelay.ts: one documented formula, rendered verbatim on
// /methodology, `null` (not a guess) where a project type doesn't fit it.
//
// METHOD (zero-carbon generation projects only, v1):
//   estimated CO2 avoided
//     = capacity (MW)
//     × typical capacity factor for that fuel/technology   (same factors as cost-of-delay)
//     × 24 (hours/day)
//     × days waiting
//     = MWh of zero-carbon generation delayed
//   × U.S. national average grid CO2 emission rate (metric tons/MWh)
//
// The emission rate is EIA's reported 2023 U.S. average: about 0.81 lbs
// CO2/kWh (https://www.eia.gov/tools/faqs/faq.php?id=74), converted to
// ~0.367 metric tons/MWh. This is a national-average-grid-mix proxy for
// "what this generation displaces," not a site- or hour-specific marginal
// emissions rate. In practice the generation actually displaced on the
// margin (often gas peakers) tends to be MORE carbon-intensive than the
// yearly average mix, so this number is more likely an understatement of
// true avoided emissions than an overstatement — a deliberately
// conservative simplification, not a favorable one.
//
// Only run for technologies with essentially zero direct generation
// emissions: solar, onshore/offshore wind, nuclear, hydro, geothermal.
// Storage isn't included — it doesn't generate net new energy, it shifts
// existing energy in time, so it doesn't have a well-defined "MWh
// delayed" in the same sense. Gas is deliberately excluded even though it
// has a published capacity factor: delaying a gas plant doesn't avoid
// emissions, so it has no entry in this calculation at all.

import type { FuelType } from "@/lib/data/taxonomies";
import { CAPACITY_FACTOR_BY_FUEL } from "./costOfDelay";

export const ZERO_CARBON_FUELS: FuelType[] = [
  "solar",
  "wind_onshore",
  "wind_offshore",
  "nuclear",
  "hydro",
  "geothermal",
];

// EIA, "How much carbon dioxide is produced per kilowatthour of U.S.
// electricity generation?" (2023 data): ~0.81 lbs CO2/kWh.
// 0.81 lbs/kWh × 1000 kWh/MWh ÷ 2204.62 lbs/metric ton ≈ 0.3675 t/MWh.
export const GRID_AVG_CO2_TONNES_PER_MWH = 0.3675;

export interface Co2AvoidedInput {
  fuelType: string;
  capacityValue: number | null;
  capacityUnit: string | null;
  daysWaiting: number | null;
}

export interface Co2AvoidedResult {
  applicable: boolean;
  reason?: string;
  estimatedMwhDelayed?: number;
  estimatedTonnesCo2Avoided?: number;
  capacityFactor?: number;
}

export function estimateCo2Avoided(input: Co2AvoidedInput): Co2AvoidedResult {
  const { fuelType, capacityValue, capacityUnit, daysWaiting: days } = input;

  if (!ZERO_CARBON_FUELS.includes(fuelType as FuelType)) {
    return {
      applicable: false,
      reason:
        "CO2-avoided is only estimated for zero-direct-emission generation (solar, wind, nuclear, hydro, geothermal) — this technology isn't in that set.",
    };
  }

  if (capacityUnit !== "MW") {
    return {
      applicable: false,
      reason: "CO2-avoided is only estimated for projects with capacity measured in MW.",
    };
  }

  const capacityFactor = CAPACITY_FACTOR_BY_FUEL[fuelType as FuelType];
  if (capacityFactor == null || capacityValue == null || days == null) {
    return {
      applicable: false,
      reason: "Missing capacity factor, capacity, or filing-date data needed to compute an estimate.",
    };
  }

  const estimatedMwhDelayed = capacityValue * capacityFactor * 24 * days;
  const estimatedTonnesCo2Avoided = estimatedMwhDelayed * GRID_AVG_CO2_TONNES_PER_MWH;

  return {
    applicable: true,
    estimatedMwhDelayed,
    estimatedTonnesCo2Avoided,
    capacityFactor,
  };
}

// "Mt CO2" (megatonnes) is the standard unit in climate/energy reporting
// for figures at this scale — matches how EIA/EPA/IPCC report emissions.
export function formatTonnesCo2(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)} Mt`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K t`;
  return `${Math.round(value).toLocaleString("en-US")} t`;
}
