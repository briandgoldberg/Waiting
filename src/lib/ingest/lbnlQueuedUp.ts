// LBNL "Queued Up" ingestion — the most comprehensive U.S. interconnection
// queue dataset (aggregated from 50+ ISOs/utilities), published annually as
// a downloadable Excel workbook at https://emp.lbl.gov/queues. This is the
// primary source for the "interconnection queue backlog" cause category.
//
// NOT a live API — there is nothing to call. This module is a *batch*
// ingestion script: download the current year's workbook by hand from
// emp.lbl.gov/queues, save it locally, and point LBNL_QUEUED_UP_XLSX_PATH
// at it (or pass a path as argv[2]).
//
// OPEN QUESTION — exact column names: LBNL ships a "codebook" tab in the
// workbook documenting every column, and column names have shifted
// slightly between annual editions in the past. We did not have a
// downloaded copy of the workbook to inspect while building this module
// (it's a manual download, not fetchable as structured data), so rather
// than hardcode column indices we picked from memory and risk silently
// misreading the file, this parser:
//   1. Reads the actual header row from the project-level data tab.
//   2. Matches each expected field against a list of plausible column-name
//      variants (see FIELD_CANDIDATES below).
//   3. Throws a clear error naming any expected field it couldn't find,
//      instead of guessing a column and importing wrong data silently.
// Before running this for real, open the workbook's codebook tab and
// confirm/adjust FIELD_CANDIDATES and DATA_SHEET_NAME_CANDIDATES against
// the actual current edition.
//
// LICENSE / REDISTRIBUTION: LBNL publishes this dataset for public research
// use with a citation request (cite "Rand et al., Queued Up: Characteristics
// of Power Plants Seeking Transmission Interconnection, Lawrence Berkeley
// National Laboratory, [year] edition"). We have not independently confirmed
// whether LBNL's terms permit redistributing derived rows (e.g. via this
// site's own API) at scale — flagging as an open question rather than
// assuming. At minimum, always keep the citation attached (see
// `sources` below) and consider linking to the source workbook instead of
// mirroring the raw dataset if that turns out to matter.

import { readFileSync } from "node:fs";
import * as XLSX from "xlsx";
import type { CauseSlug } from "@/lib/data/causeCategories";
import type { FuelType, ProjectStage } from "@/lib/data/taxonomies";
import { resolveMatchKey } from "@/lib/ingest/manualOverrides";
import { upsertNormalizedProject, type NormalizedProject } from "@/lib/ingest/common";

const DATA_SHEET_NAME_CANDIDATES = ["data", "Queued Up Data", "Interconnection Requests"];

const FIELD_CANDIDATES: Record<string, string[]> = {
  queueId: ["q_id", "queue_id", "project_id"],
  status: ["q_status", "queue_status", "status"],
  entity: ["entity", "utility", "balancing_authority", "iso_rto"],
  state: ["state", "state_poi"],
  county: ["county", "county_1"],
  resourceType: ["type_clean", "resource_type", "fuel", "type"],
  capacityMw: ["mw1", "capacity_mw", "mw_total"],
  storageCapacityMw: ["mw2", "storage_mw"],
  queueDate: ["q_date", "queue_date", "date_submitted", "date_entered_queue"],
  withdrawnDate: ["withdrawn_date", "date_withdrawn"],
  iaDate: ["ia_date", "date_ia_executed"],
  codDate: ["cod", "cod_date", "estimated_cod"],
};

type FieldMap = Record<keyof typeof FIELD_CANDIDATES, string | undefined>;

function resolveFieldMap(headerRow: string[]): FieldMap {
  const normalized = headerRow.map((h) => h?.toString().trim().toLowerCase());
  const map = {} as FieldMap;
  const missing: string[] = [];

  for (const [field, candidates] of Object.entries(FIELD_CANDIDATES)) {
    const idx = normalized.findIndex((h) => candidates.includes(h));
    if (idx === -1) {
      missing.push(field);
      continue;
    }
    map[field as keyof typeof FIELD_CANDIDATES] = headerRow[idx];
  }

  if (missing.length > 0) {
    throw new Error(
      `LBNL Queued Up parser could not find columns for: ${missing.join(", ")}. ` +
        `Open the workbook's codebook tab, find the real column names, and add them ` +
        `to FIELD_CANDIDATES in src/lib/ingest/lbnlQueuedUp.ts.`,
    );
  }

  return map;
}

const RESOURCE_TYPE_TO_FUEL: [RegExp, FuelType][] = [
  [/solar/i, "solar"],
  [/offshore wind/i, "wind_offshore"],
  [/wind/i, "wind_onshore"],
  [/storage|battery/i, "storage"],
  [/gas/i, "gas"],
  [/nuclear/i, "nuclear"],
  [/hydro/i, "hydro"],
  [/geothermal/i, "geothermal"],
];

function resourceTypeToFuel(resourceType: string): FuelType {
  for (const [re, fuel] of RESOURCE_TYPE_TO_FUEL) {
    if (re.test(resourceType)) return fuel;
  }
  return "other";
}

function queueStatusToStage(status: string): ProjectStage {
  const s = status.toLowerCase();
  if (s.includes("withdraw")) return "cancelled";
  if (s.includes("operational") || s.includes("in service")) return "completed";
  if (s.includes("ia executed") || s.includes("agreement")) return "approved_awaiting_construction";
  return "interconnection_study";
}

interface QueuedUpRow {
  [column: string]: string | number | undefined;
}

export function parseWorkbook(filePath: string): QueuedUpRow[] {
  const buf = readFileSync(filePath);
  const workbook = XLSX.read(buf, { type: "buffer" });
  const sheetName = workbook.SheetNames.find((n) =>
    DATA_SHEET_NAME_CANDIDATES.some((c) => n.toLowerCase() === c.toLowerCase()),
  );
  if (!sheetName) {
    throw new Error(
      `Could not find a data sheet among candidates [${DATA_SHEET_NAME_CANDIDATES.join(", ")}]. ` +
        `Sheets in this workbook: ${workbook.SheetNames.join(", ")}`,
    );
  }
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<QueuedUpRow>(sheet, { defval: null });
  return rows;
}

export function normalizeQueuedUpRow(row: QueuedUpRow, fieldMap: FieldMap): NormalizedProject {
  const get = (field: keyof typeof FIELD_CANDIDATES) => {
    const col = fieldMap[field];
    return col ? row[col] : undefined;
  };

  const queueId = String(get("queueId") ?? "");
  const matchKey = resolveMatchKey("lbnl", queueId);
  const resourceType = String(get("resourceType") ?? "");
  const fuelType = resourceTypeToFuel(resourceType);
  const status = String(get("status") ?? "Active");
  const capacityMw = Number(get("capacityMw") ?? NaN);
  const queueDateRaw = get("queueDate");
  const queueDate = queueDateRaw ? new Date(queueDateRaw as string) : null;

  const causeSlugs: CauseSlug[] = ["interconnection_queue_backlog"];

  return {
    matchKey,
    name: `Interconnection Request ${queueId}${resourceType ? ` (${resourceType})` : ""}`,
    projectType: fuelType === "storage" ? "storage" : "generation",
    fuelType,
    state: get("state") ? String(get("state")) : null,
    county: get("county") ? String(get("county")) : null,
    capacityValue: Number.isFinite(capacityMw) ? capacityMw : null,
    capacityUnit: "MW",
    applicationFiledDate: queueDate && !Number.isNaN(queueDate.getTime()) ? queueDate : null,
    dateConfidence: "exact",
    currentStatus: `Interconnection queue status: ${status}`,
    currentStage: queueStatusToStage(status),
    causeSlugs,
    causeDetail:
      "Sourced from LBNL's Queued Up interconnection queue dataset — this project is waiting on its grid operator's interconnection study/agreement process.",
    dataQualityNote:
      "No exact site address/lat-lon is published in this dataset (state/county only); this record will not have a precise map pin until geocoded or cross-referenced with another source.",
    sources: [
      {
        label: "LBNL Queued Up (interconnection queue dataset)",
        url: "https://emp.lbl.gov/queues",
      },
    ],
    externalIds: { lbnl: queueId },
  };
}

export async function ingestLbnlQueuedUp(filePath: string) {
  const rows = parseWorkbook(filePath);
  if (rows.length === 0) {
    console.log("No rows found in workbook.");
    return;
  }
  const headerRow = Object.keys(rows[0]);
  const fieldMap = resolveFieldMap(headerRow);

  let count = 0;
  for (const row of rows) {
    await upsertNormalizedProject(normalizeQueuedUpRow(row, fieldMap));
    count += 1;
  }
  console.log(`LBNL Queued Up ingestion complete: upserted ${count} projects.`);
}

if (require.main === module) {
  const filePath = process.argv[2] ?? process.env.LBNL_QUEUED_UP_XLSX_PATH;
  if (!filePath) {
    console.error(
      "Usage: npx tsx src/lib/ingest/lbnlQueuedUp.ts <path-to-downloaded-workbook.xlsx>\n" +
        "(or set LBNL_QUEUED_UP_XLSX_PATH). Download the workbook from https://emp.lbl.gov/queues first.",
    );
    process.exit(1);
  }
  ingestLbnlQueuedUp(filePath).catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
