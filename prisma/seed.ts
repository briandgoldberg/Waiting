// v1 seed data: a small, hand-researched set of real, individually-cited
// energy projects spanning every fuel type and every cause category —
// deliberately NOT auto-generated from the live ingestion modules (see
// src/lib/ingest/), because none of those currently have live API keys /
// downloaded workbooks available in this environment, and because a site
// whose whole argument rests on real project data should not launch with
// fabricated specifics standing in for research.
//
// Every project below traces to public reporting or a primary source link
// in its `sources` array, checked while building this seed set. Where a
// date or figure wasn't confidently pinned down to the day/exact number,
// `dateConfidence: "approximate"` or a `dataQualityNote` says so explicitly
// rather than presenting invented precision as fact.
//
// This is a v1 launch set, not a comprehensive national database — see the
// root README "Open questions" for what's deliberately not covered yet
// (e.g. individual LBNL interconnection-queue projects, hydro relicensing,
// onshore wind, standalone gas plants).

import { PrismaClient } from "@prisma/client";
import { upsertNormalizedProject, type NormalizedProject } from "../src/lib/ingest/common";

const prisma = new PrismaClient();

const seedMatchKey = (key: string) => `seed:${key}`;

const projects: NormalizedProject[] = [
  {
    matchKey: seedMatchKey("grain-belt-express-phase-1"),
    name: "Grain Belt Express Transmission — Phase 1",
    projectType: "transmission",
    fuelType: "transmission",
    lat: 39.7378,
    lon: -94.238,
    state: "MO",
    capacityValue: 2500,
    capacityUnit: "MW",
    applicationFiledDate: new Date("2014-01-01"),
    dateConfidence: "approximate",
    currentStatus:
      "FAST-41 covered project; federal review timetable paused in 2025 after a DOE loan guarantee was terminated, then resumed in early 2026. Construction on Phase 1 anticipated to begin in 2026.",
    currentStage: "agency_permitting",
    causeSlugs: ["litigation_legal_challenge", "transmission_siting_land_rights"],
    causeDetail:
      "An 800-mile HVDC line proposed since around 2010, Grain Belt Express was rejected by the Missouri Public Service Commission three times (2015-2017) before a 2018 Missouri Supreme Court ruling reopened the path to a 2019 state approval. Now a FAST-41 covered project, its federal review timetable was paused in mid-2025 after the U.S. Department of Energy terminated a $4.9B conditional loan guarantee commitment; the sponsor requested to resume in January 2026, and the Illinois Supreme Court separately rejected a state-permit challenge that same month.",
    isAggregateExample: false,
    dataQualityNote:
      "Capacity figure (~2,500 MW) is for the Kansas–Missouri Phase 1 segment per developer/media reporting; the full multi-phase project has been described elsewhere as up to ~5,000 MW. Original filing date is approximate — public reporting places the project's origin around 2010-2014.",
    sources: [
      {
        label: "Permitting Dashboard — Grain Belt Express Transmission Phase 1",
        url: "https://www.permits.performance.gov/permitting-project/fast-41-covered-projects/grain-belt-express-transmission-phase-1",
      },
      {
        label: "Missouri Independent — Grain Belt Express clears legal hurdle",
        url: "https://missouriindependent.com/briefs/grain-belt-express-clears-another-legal-hurdle-with-missouri-appeals-court-ruling/",
      },
      {
        label: "NPR Illinois — State high court rejects challenge",
        url: "https://www.nprillinois.org/illinois/2026-01-23/state-high-court-rejects-challenge-to-wind-generated-transmission-line",
      },
    ],
    externalIds: {},
    milestones: [
      {
        date: new Date("2014-01-01"),
        dateConfidence: "approximate",
        stage: "state_siting_application",
        description: "Original Missouri Public Service Commission siting application filed (project concept dates to roughly 2010).",
      },
      {
        date: new Date("2017-06-01"),
        dateConfidence: "approximate",
        stage: "state_denial",
        description: "Missouri PSC rejects the application for the third time since 2015.",
      },
      {
        date: new Date("2018-07-01"),
        dateConfidence: "approximate",
        stage: "court_ruling",
        description: "Missouri Supreme Court ruling reinterprets state utility law, reopening the path to approval.",
      },
      {
        date: new Date("2019-03-01"),
        dateConfidence: "approximate",
        stage: "state_approval",
        description: "Missouri PSC approves the project.",
      },
      {
        date: new Date("2025-07-23"),
        dateConfidence: "exact",
        stage: "financing_setback",
        description: "DOE terminates its conditional $4.9B federal loan guarantee commitment for the project.",
      },
      {
        date: new Date("2025-11-01"),
        dateConfidence: "approximate",
        stage: "federal_pause",
        description: "DOE Loan Programs Office requests continuation of a pause in the FAST-41 permitting timetable through Feb 20, 2026.",
      },
      {
        date: new Date("2026-01-22"),
        dateConfidence: "exact",
        stage: "resume_request",
        description: "Project sponsor requests the project move from paused to in-progress status for federal authorizations and reviews.",
      },
      {
        date: new Date("2026-01-23"),
        dateConfidence: "exact",
        stage: "litigation",
        description: "Illinois Supreme Court rejects a challenge to the project's state permit.",
      },
      {
        date: new Date("2026-04-21"),
        dateConfidence: "exact",
        stage: "permitting_update",
        description: "USACE posts an updated permitting timetable; extension granted for Section 106 (historic preservation) review to July 15, 2026.",
      },
    ],
  },
  {
    matchKey: seedMatchKey("commonwealth-lng"),
    name: "Commonwealth LNG",
    projectType: "lng",
    fuelType: "lng",
    lat: 29.7961,
    lon: -93.3305,
    state: "LA",
    county: "Cameron",
    capacityValue: 9.5,
    capacityUnit: "MTPA",
    applicationFiledDate: new Date("2019-08-20"),
    dateConfidence: "exact",
    currentStatus:
      "FERC-approved (twice, after a court remand); developer seeking a four-year construction extension while a Louisiana state court's vacatur of its Coastal Use Permit is contested.",
    currentStage: "litigation",
    causeSlugs: ["litigation_legal_challenge", "multi_agency_permitting"],
    causeDetail:
      "FERC approved the 9.5 MTPA export terminal in late 2022; after environmental groups sued, the D.C. Circuit sent the approval back to FERC in 2024 for further environmental-justice/climate analysis. FERC re-approved the project in mid-2025 and a state Coastal Use Permit followed, but a Louisiana state court vacated that permit in October 2025 over the same category of analysis, even as the developer seeks a multi-year construction-schedule extension from FERC.",
    isAggregateExample: false,
    dataQualityNote: null,
    sources: [
      {
        label: "Oil & Gas Journal — Court sends approval back to FERC",
        url: "https://www.ogj.com/general-interest/government/article/55126658/us-federal-court-sends-commonwealth-lng-approval-back-to-ferc-for-rereview-threatening-plant-timeline",
      },
      {
        label: "Oil & Gas Journal — Commonwealth LNG seeks 4-year extension",
        url: "https://www.ogj.com/pipelines-transportation/lng/news/55323172/commonwealth-lng-asks-ferc-for-4-year-extension-to-export-from-cameron-la-plant",
      },
      {
        label: "LNG Prime — Commonwealth LNG secures FERC extension",
        url: "https://lngprime.com/americas/commonwealth-lng-secures-ferc-extension/167349/",
      },
    ],
    externalIds: {},
    milestones: [
      { date: new Date("2019-08-20"), dateConfidence: "exact", stage: "application_filed", description: "FERC certificate application filed." },
      { date: new Date("2022-11-01"), dateConfidence: "approximate", stage: "federal_approval", description: "FERC votes to give final approval to build and operate the facility." },
      { date: new Date("2024-01-01"), dateConfidence: "approximate", stage: "policy_pause", description: "White House pause on new LNG export license approvals begins, pending DOE review." },
      { date: new Date("2024-07-01"), dateConfidence: "approximate", stage: "litigation", description: "D.C. Circuit sends FERC's approval back for additional environmental-justice/climate analysis." },
      { date: new Date("2025-02-01"), dateConfidence: "approximate", stage: "federal_approval", description: "DOE approves non-FTA export authorization." },
      { date: new Date("2025-06-01"), dateConfidence: "approximate", stage: "federal_approval", description: "FERC completes additional analysis and re-approves the project." },
      { date: new Date("2025-07-26"), dateConfidence: "exact", stage: "permit_issued", description: "Louisiana Coastal Use Permit issued." },
      { date: new Date("2025-10-02"), dateConfidence: "exact", stage: "extension_request", description: "Commonwealth files for an approximately four-year construction extension." },
      { date: new Date("2025-10-10"), dateConfidence: "exact", stage: "litigation", description: "38th Judicial District Court (LA) vacates the Coastal Use Permit over insufficient environmental-justice/climate analysis." },
    ],
  },
  {
    matchKey: seedMatchKey("mvp-southgate"),
    name: "MVP Southgate",
    projectType: "pipeline",
    fuelType: "pipeline",
    lat: 36.4934,
    lon: -79.7442,
    state: "NC",
    county: "Rockingham",
    capacityValue: 31.3,
    capacityUnit: "mi (30-in diameter)",
    applicationFiledDate: new Date("2018-01-01"),
    dateConfidence: "approximate",
    currentStatus:
      "Key state and federal permits issued in late 2025/early 2026; the 4th Circuit has allowed construction to proceed while the D.C. Circuit separately reviews FERC's underlying certificate.",
    currentStage: "litigation",
    causeSlugs: ["multi_agency_permitting", "litigation_legal_challenge"],
    causeDetail:
      "A 31.3-mile extension of the Mountain Valley Pipeline into North Carolina, Southgate needs sign-off from FERC (federal certificate), Virginia DEQ and North Carolina DEQ (Clean Water Act Section 401), and the Army Corps of Engineers (Section 404) — running as separate processes with parallel litigation in two federal circuits. NC DEQ issued its 401 permit in November 2025, Virginia DEQ its individual permit in January 2026, and the Army Corps its 404 permit in March 2026; the 4th Circuit denied motions to stay construction in April 2026 while the D.C. Circuit continues reviewing FERC's certificate.",
    isAggregateExample: false,
    dataQualityNote:
      "No public throughput (Mcf/d) figure was found in the sources checked for this entry; capacity is shown as pipeline length/diameter instead. Original FERC filing date is approximate.",
    sources: [
      {
        label: "Natural Gas Intel — MVP Southgate secures NC water permit",
        url: "https://www.naturalgasintel.com/news/mvp-southgate-secures-north-carolina-water-permit-as-southeast-demand-climbs/",
      },
      {
        label: "Southern Environmental Law Center — Court denies stays",
        url: "https://www.selc.org/press-release/u-s-court-of-appeals-denies-stays-for-virginia-deq-and-north-carolina-deq-mvp-southgate-401-certifications/",
      },
      {
        label: "Pipeline & Gas Journal — Court denies stay, construction to proceed",
        url: "https://pgjonline.com/news/2026/may/court-denies-stay-allows-mvp-southgate-pipeline-construction-to-move-forward",
      },
    ],
    externalIds: {},
    milestones: [
      { date: new Date("2018-01-01"), dateConfidence: "approximate", stage: "application_filed", description: "FERC certificate application filed for the Southgate extension." },
      { date: new Date("2025-11-01"), dateConfidence: "approximate", stage: "permit_issued", description: "North Carolina DEQ issues a Clean Water Act Section 401 water-quality permit." },
      { date: new Date("2026-01-13"), dateConfidence: "exact", stage: "permit_issued", description: "Virginia DEQ issues an Individual Permit for the Southgate Amendment." },
      { date: new Date("2026-03-20"), dateConfidence: "exact", stage: "permit_issued", description: "U.S. Army Corps of Engineers issues a Section 404 permit." },
      { date: new Date("2026-04-15"), dateConfidence: "approximate", stage: "litigation", description: "4th Circuit Court of Appeals denies motions to stay construction pending water-permit litigation." },
    ],
  },
  {
    matchKey: seedMatchKey("southcoast-wind"),
    name: "SouthCoast Wind",
    projectType: "generation",
    fuelType: "wind_offshore",
    lat: 40.9,
    lon: -70.7,
    state: "MA",
    capacityValue: 2400,
    capacityUnit: "MW",
    applicationFiledDate: new Date("2021-01-01"),
    dateConfidence: "approximate",
    currentStatus:
      "BOEM's prior approval is under federal reconsideration after a court-granted remand; separately facing a lawsuit from the Town of Nantucket.",
    currentStage: "litigation",
    causeSlugs: ["litigation_legal_challenge", "local_state_opposition"],
    causeDetail:
      "BOEM approved SouthCoast Wind's Construction and Operations Plan in January 2025. The federal government then sought to reconsider its own approval; a D.C. district court granted a remand in November 2025 allowing BOEM to review it again, and the Town of Nantucket separately sued in early 2026 seeking to have the approval set aside entirely.",
    isAggregateExample: false,
    dataQualityNote: "~2,400 MW is the developer-stated project capacity; not independently re-verified for this entry.",
    sources: [
      { label: "WBUR — Trump administration moves to revoke SouthCoast Wind permit", url: "https://www.wbur.org/news/2025/09/19/southcoast-wind-permit-seek-to-revoked-trump" },
      { label: "Maritime Executive — SouthCoast Wind loses court appeal", url: "https://maritime-executive.com/article/southcoast-wind-loses-court-appeal-to-block-boem-review-of-permits" },
      { label: "New Bedford Light — Offshore wind tracker", url: "https://newbedfordlight.org/offshore-wind-tracker-whats-happening-to-massachusetts-projects/" },
    ],
    externalIds: {},
    milestones: [
      { date: new Date("2021-01-01"), dateConfidence: "approximate", stage: "application_filed", description: "Construction and Operations Plan submitted to BOEM." },
      { date: new Date("2025-01-17"), dateConfidence: "exact", stage: "federal_approval", description: "BOEM approves the project's Construction and Operations Plan." },
      { date: new Date("2025-09-19"), dateConfidence: "approximate", stage: "federal_reconsideration", description: "Federal government moves to reconsider/revoke the COP approval." },
      { date: new Date("2025-11-01"), dateConfidence: "approximate", stage: "litigation", description: "Federal court grants a remand allowing BOEM to review the approval again." },
      { date: new Date("2026-01-15"), dateConfidence: "approximate", stage: "litigation", description: "Town of Nantucket sues DOI/BOEM seeking to set aside the approval." },
    ],
  },
  {
    matchKey: seedMatchKey("atlantic-shores-offshore-wind"),
    name: "Atlantic Shores Offshore Wind (Project 1)",
    projectType: "generation",
    fuelType: "wind_offshore",
    lat: 39.3,
    lon: -74.1,
    state: "NJ",
    capacityValue: 1510,
    capacityUnit: "MW",
    applicationFiledDate: new Date("2021-01-01"),
    dateConfidence: "approximate",
    currentStatus: "Effectively halted since March 2025 while EPA reconsiders a Clean Air Act permit it had already issued.",
    currentStage: "agency_permitting",
    causeSlugs: ["multi_agency_permitting", "litigation_legal_challenge"],
    causeDetail:
      "EPA Region 2 issued Atlantic Shores a Clean Air Act permit, then EPA itself requested to reconsider that same approval; the Environmental Appeals Board granted a voluntary remand in early 2025, effectively halting the project as of March 14, 2025 while the agency re-reviews a permit it had already approved.",
    isAggregateExample: false,
    dataQualityNote: "~1,510 MW is the commonly reported developer-stated capacity for Project 1; not independently re-verified for this entry.",
    sources: [
      { label: "Georgetown Climate Center — Federal actions restricting wind development", url: "https://www.georgetownclimate.org/articles/admin-actions-restrict-wind-development.html" },
      { label: "Congressional Research Service — Trump administration actions on offshore wind", url: "https://www.congress.gov/crs_external_products/LSB/PDF/LSB11402/LSB11402.1.pdf" },
    ],
    externalIds: {},
    milestones: [
      { date: new Date("2021-01-01"), dateConfidence: "approximate", stage: "application_filed", description: "Federal permitting process begins (BOEM/EPA)." },
      { date: new Date("2025-02-28"), dateConfidence: "exact", stage: "agency_reconsideration", description: "EPA Region 2 files a motion for voluntary remand of the project's own Clean Air Act permit." },
      { date: new Date("2025-03-14"), dateConfidence: "exact", stage: "halted", description: "Project effectively halted as EPA reconsiders its own prior approval." },
    ],
  },
  {
    matchKey: seedMatchKey("revolution-wind"),
    name: "Revolution Wind",
    projectType: "generation",
    fuelType: "wind_offshore",
    lat: 41.13,
    lon: -71.4,
    state: "RI",
    capacityValue: 704,
    capacityUnit: "MW",
    applicationFiledDate: new Date("2020-01-01"),
    dateConfidence: "approximate",
    currentStatus: "Under construction; twice hit with federal stop-work/suspension orders in 2025, twice resumed via court-ordered preliminary injunction.",
    currentStage: "under_construction",
    causeSlugs: ["litigation_legal_challenge"],
    causeDetail:
      "Revolution Wind was fully permitted and under construction when BOEM issued a stop-work order on August 22, 2025; a federal court granted a preliminary injunction a month later allowing work to resume. A second suspension order followed on December 22, 2025 — alongside four other fully-permitted offshore projects — and a second injunction again allowed work to resume on January 12, 2026. Unlike the other cause categories on this site, this project's delay is purely litigation/administrative-reversal risk on an already-approved project, not an unresolved permitting review.",
    isAggregateExample: false,
    dataQualityNote: "Original Construction and Operations Plan filing date is approximate; COP approval year (2023) is commonly reported but not re-verified to the day for this entry.",
    sources: [
      { label: "Revolution Wind — Court grants preliminary injunction, construction resumes", url: "https://revolution-wind.com/news/2026/01/us-federal-court-grants-preliminary-injunction-allowing-revolution-wind-construction-to-resume" },
      { label: "CT Mirror — Work continues as appeal deadline passes", url: "https://ctmirror.org/2025/11/24/ct-revolution-wind-ruling-appeal/" },
      { label: "Spencer Fane — Revolution Wind may proceed", url: "https://www.spencerfane.com/insight/revolution-wind-may-proceed-with-its-offshore-wind-energy-project-the-trump-administration-loses-another-court-battle/" },
    ],
    externalIds: {},
    milestones: [
      { date: new Date("2020-01-01"), dateConfidence: "approximate", stage: "application_filed", description: "Construction and Operations Plan process begins." },
      { date: new Date("2023-01-01"), dateConfidence: "approximate", stage: "federal_approval", description: "BOEM approves the project's Construction and Operations Plan." },
      { date: new Date("2025-08-22"), dateConfidence: "exact", stage: "stop_work", description: "BOEM issues a stop-work order halting construction." },
      { date: new Date("2025-09-22"), dateConfidence: "exact", stage: "litigation", description: "Federal court grants a preliminary injunction; work resumes." },
      { date: new Date("2025-12-22"), dateConfidence: "exact", stage: "stop_work", description: "DOI issues a second suspension order, alongside four other offshore wind projects." },
      { date: new Date("2026-01-12"), dateConfidence: "exact", stage: "litigation", description: "Federal court grants a second preliminary injunction; work resumes again." },
    ],
  },
  {
    matchKey: seedMatchKey("palisades-smr300"),
    name: "Palisades SMR-300 (Twin Units)",
    projectType: "generation",
    fuelType: "nuclear",
    lat: 42.3223,
    lon: -86.3117,
    state: "MI",
    county: "Van Buren",
    capacityValue: 600,
    capacityUnit: "MW",
    applicationFiledDate: new Date("2026-01-11"),
    dateConfidence: "exact",
    currentStatus: "NRC combined license application in early-stage review.",
    currentStage: "environmental_review",
    causeSlugs: ["environmental_review_nepa"],
    causeDetail:
      "Holtec submitted the NRC combined license application for twin 300 MW SMR-300 units at the existing Palisades site in January 2026. Under Executive Order 14300, the NRC is directed to complete final licensing decisions within 18 months for new-reactor applications — but the review, which folds NRC's own NEPA environmental review in alongside the safety review, is still in its early stages as of this writing.",
    isAggregateExample: false,
    dataQualityNote: null,
    sources: [
      { label: "Neutron Bytes — Holtec submits COL application for Palisades SMR-300s", url: "https://neutronbytes.com/2026/01/11/holtec-submits-license-application-to-nrc-for-the-palisades-twin-smr-300s/" },
      { label: "NRC — Licensing Efficiencies", url: "https://www.nrc.gov/about-nrc/governing-laws/advance-act/licensing-efficiencies" },
    ],
    externalIds: {},
    milestones: [
      { date: new Date("2026-01-11"), dateConfidence: "exact", stage: "application_filed", description: "Holtec submits the NRC combined license application for twin SMR-300 units." },
    ],
  },
  {
    matchKey: seedMatchKey("wagoner-county-solar"),
    name: "NextEra Wagoner County Solar Project",
    projectType: "generation",
    fuelType: "solar",
    lat: 35.967,
    lon: -95.3608,
    state: "OK",
    county: "Wagoner",
    capacityValue: null,
    capacityUnit: null,
    applicationFiledDate: new Date("2025-01-01"),
    dateConfidence: "approximate",
    currentStatus: "Conditional use permit denied by county commissioners; developer's path forward unclear as of the source reporting.",
    currentStage: "local_review",
    causeSlugs: ["local_state_opposition"],
    causeDetail:
      "Wagoner County Commissioners voted 2-1 to deny NextEra Energy Resources' conditional use permit request for its proposed solar project after public opposition, per June 2025 reporting — a purely local zoning-authority decision, not a federal or state regulatory bottleneck.",
    isAggregateExample: false,
    dataQualityNote: "Proposed capacity (MW) was not disclosed in the public reporting used for this entry; exact application-filed date is approximate.",
    sources: [
      { label: "KGOU — Future of Wagoner County solar farm uncertain", url: "https://www.kgou.org/energy/2025-06-17/future-of-wagoner-county-solar-farm-uncertain-after-public-opposition-zoning-rejection" },
    ],
    externalIds: {},
    milestones: [
      { date: new Date("2025-06-17"), dateConfidence: "approximate", stage: "local_denial", description: "Wagoner County Commissioners vote 2-1 to deny the conditional use permit following public opposition." },
    ],
  },
  {
    matchKey: seedMatchKey("pjm-interconnection-queue-aggregate"),
    name: "PJM Interconnection Queue — Regional Aggregate (illustrative)",
    projectType: "generation",
    fuelType: "other",
    lat: 40.114,
    lon: -75.4358,
    state: "PA",
    capacityValue: 67000,
    capacityUnit: "MW",
    applicationFiledDate: null,
    dateConfidence: "approximate",
    currentStatus:
      "PJM reports roughly 67,000 MW of active interconnection requests, down from a peak near 200,000 MW before a 2022 queue-processing pause; typical interconnection-agreement turnaround is now reported at 1-2 years, though projects that reached commercial operation in 2025 had spent an average of 8 years in the queue.",
    currentStage: "interconnection_study",
    causeSlugs: ["interconnection_queue_backlog"],
    causeDetail:
      "This entry is a regional aggregate, not a single physical project — included so the interconnection-queue-backlog cause category has a representative, real, cited data point in this v1 seed set pending full ingestion of LBNL's project-level Queued Up dataset (see src/lib/ingest/lbnlQueuedUp.ts). It is excluded from this site's aggregate headline stats (total capacity, project-years, cost of delay) to avoid double-counting against the individual projects also shown.",
    isAggregateExample: true,
    dataQualityNote:
      "Represents PJM's queue as a whole, not one project. No single application-filed date or map-pin location applies; the pin is placed at PJM's headquarters (Audubon, PA) purely for map display.",
    sources: [
      { label: "PJM — Generation Interconnection Reform Progress Fact Sheet (2026)", url: "https://www.pjm.com/-/media/DotCom/about-pjm/newsroom/fact-sheets/interconnection-reform-progress-fact-sheet.pdf" },
      { label: "E&E News — Renewables backlog plan for PJM region", url: "https://www.eenews.net/articles/renewables-backlog-plan-for-pjm-region-met-with-mixed-reviews/" },
      { label: "Renewable Energy World — PJM interconnection queue moving again", url: "https://www.renewableenergyworld.com/power-grid/transmission/at-long-last-the-pjm-interconnection-queue-is-moving-again-now-what/" },
    ],
    externalIds: {},
    milestones: [
      { date: new Date("2022-01-01"), dateConfidence: "approximate", stage: "queue_paused", description: "PJM pauses new interconnection studies to rework its process amid a massive backlog." },
      { date: new Date("2023-07-01"), dateConfidence: "approximate", stage: "reform", description: "FERC Order 2023 requires cluster-study interconnection reform nationally." },
      { date: new Date("2025-06-01"), dateConfidence: "approximate", stage: "status_update", description: "Projects reaching commercial operation in 2025 had spent an average of 8 years in the queue." },
      { date: new Date("2026-01-01"), dateConfidence: "approximate", stage: "status_update", description: "PJM reports the active queue reduced to roughly 67,000 MW with 1-2 year interconnection-agreement turnaround." },
    ],
  },
  {
    matchKey: seedMatchKey("ocean-wind-1"),
    name: "Ocean Wind 1",
    projectType: "generation",
    fuelType: "wind_offshore",
    lat: 39.2,
    lon: -74.3,
    state: "NJ",
    capacityValue: 1100,
    capacityUnit: "MW",
    applicationFiledDate: new Date("2019-01-01"),
    dateConfidence: "approximate",
    currentStatus: "Cancelled by developer Ørsted in November 2023.",
    currentStage: "cancelled",
    causeSlugs: ["financing_supply_chain_other"],
    causeDetail:
      "Included deliberately as a control-group example: Ørsted cancelled Ocean Wind 1 and 2 in late 2023, citing rising interest rates, inflation, and offshore-installation-vessel supply-chain constraints — not a permitting bottleneck. Shown to demonstrate that not every delayed or cancelled project on this site is a permitting-reform story, and that this site is not claiming otherwise.",
    isAggregateExample: false,
    dataQualityNote: null,
    sources: [
      { label: "EIA Today in Energy — Cancellations reduce expected offshore wind capacity", url: "https://www.eia.gov/todayinenergy/detail.php?id=62445" },
      { label: "E&E News — Offshore wind faces more financial turbulence in 2024", url: "https://www.eenews.net/articles/offshore-wind-faces-more-financial-turbulence-in-2024/" },
    ],
    externalIds: {},
    milestones: [
      { date: new Date("2019-01-01"), dateConfidence: "approximate", stage: "application_filed", description: "BOEM permitting process begins." },
      { date: new Date("2023-11-01"), dateConfidence: "approximate", stage: "cancelled", description: "Ørsted cancels Ocean Wind 1 and 2, citing financing and supply-chain conditions." },
    ],
  },
];

async function main() {
  for (const p of projects) {
    const project = await upsertNormalizedProject(p);
    console.log(`Seeded: ${project.name}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
