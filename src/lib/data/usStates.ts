// Postal abbreviation -> full name, for the state filter. Project `state`
// fields are stored as USPS codes (see src/lib/ingest/*), sometimes as a
// comma-separated list for pipelines that span multiple states (e.g.
// "NY,CT,MA,RI") — see matchesFilters in src/lib/filters.ts for how a
// single-state filter matches against those.
export const STATE_NAMES: Record<string, string> = {
  AL: "Alabama",
  AK: "Alaska",
  AZ: "Arizona",
  AR: "Arkansas",
  CA: "California",
  CO: "Colorado",
  CT: "Connecticut",
  DE: "Delaware",
  DC: "District of Columbia",
  FL: "Florida",
  GA: "Georgia",
  HI: "Hawaii",
  ID: "Idaho",
  IL: "Illinois",
  IN: "Indiana",
  IA: "Iowa",
  KS: "Kansas",
  KY: "Kentucky",
  LA: "Louisiana",
  ME: "Maine",
  MD: "Maryland",
  MA: "Massachusetts",
  MI: "Michigan",
  MN: "Minnesota",
  MS: "Mississippi",
  MO: "Missouri",
  MT: "Montana",
  NE: "Nebraska",
  NV: "Nevada",
  NH: "New Hampshire",
  NJ: "New Jersey",
  NM: "New Mexico",
  NY: "New York",
  NC: "North Carolina",
  ND: "North Dakota",
  OH: "Ohio",
  OK: "Oklahoma",
  OR: "Oregon",
  PA: "Pennsylvania",
  RI: "Rhode Island",
  SC: "South Carolina",
  SD: "South Dakota",
  TN: "Tennessee",
  TX: "Texas",
  UT: "Utah",
  VT: "Vermont",
  VA: "Virginia",
  WA: "Washington",
  WV: "West Virginia",
  WI: "Wisconsin",
  WY: "Wyoming",
  MX: "Mexico",
};

export function stateName(code: string): string {
  return STATE_NAMES[code] ?? code;
}

// Splits a project's (possibly multi-state, e.g. "NY,CT,MA,RI" or "TX, MX")
// `state` field into individual USPS codes.
export function splitStateCodes(state: string | null): string[] {
  if (!state) return [];
  return state.split(",").map((s) => s.trim()).filter(Boolean);
}
