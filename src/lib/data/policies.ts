// The site's actual policy asks — deliberately kept separate from
// src/lib/data/causeCategories.ts. A "cause" is a neutral, factual
// description of why a project is stuck (used for filtering/tagging real
// projects); a "policy" here is an argued position on what should change
// about the law or process to fix it, including where reasonable people
// disagree. Consolidated into one page (/policies) instead of one page per
// cause so the whole policy landscape reads as a single, comparable set of
// proposals rather than being scattered across per-project call-outs.
//
// Content is informed by permitting-reform arguments made publicly by
// Citizens' Climate Lobby (citizensclimatelobby.org) among other bipartisan
// reform advocates, rewritten in this project's own words rather than
// quoted, and framed neutrally with real strengths *and* weaknesses per
// policy rather than as pure advocacy copy.
//
// Bill links intentionally point to Congress.gov keyword searches rather
// than pinned bill numbers: legislation is reintroduced under a new number
// every two-year Congress, so a specific citation goes stale fast, while a
// topic search stays current. Where a specific, still-relevant bill is
// named in the prose, treat it as illustrative context, not a guarantee
// it's still pending in the current Congress — verify on Congress.gov
// before citing it elsewhere.

import type { CauseSlug } from "./causeCategories";

export interface Bill {
  label: string;
  url: string;
  note?: string;
}

export interface Policy {
  /** Matches a CauseSlug 1:1 in v1 — used for #anchors and pulling live project examples. */
  slug: CauseSlug;
  title: string;
  /** Short tagline, e.g. for nav/index chips. */
  oneLiner: string;
  /** The problem this policy is trying to solve. */
  problem: string;
  /** The actual proposal. */
  proposal: string;
  strengths: string[];
  weaknesses: string[];
  bills: Bill[];
}

function billSearch(query: string): string {
  return `https://www.congress.gov/search?q=${encodeURIComponent(query)}`;
}

export const POLICIES: Policy[] = [
  {
    slug: "interconnection_queue_backlog",
    title: "Interconnection process reform",
    oneLiner: "Give every project a fast, real yes or no on grid connection.",
    problem:
      "Tens of thousands of proposed generation and storage projects sit in grid-operator interconnection queues for years — in some regions, longer than it takes to actually build the project. Studies are done one at a time in the order requests arrive, regardless of how ready or serious a given project is, so speculative applications can clog the line ahead of ones that are fully financed and permit-ready. There's often no deadline forcing a real decision either way, so projects wait in limbo rather than getting a timely yes or no.",
    proposal:
      "Move every regional grid operator to \"first-ready, first-served\" cluster studies with binding study deadlines and financial commitments (like readiness deposits) that discourage speculative applications — full implementation of FERC Order No. 2023, with enforcement teeth so a project gets a real, timely answer instead of sitting in queue indefinitely.",
    strengths: [
      "Doesn't require new legislation for the FERC-jurisdictional pieces — Order 2023 is already final; the main gap is full implementation and enforcement across every region.",
      "Readiness deposits and cluster studies quickly separate serious, financed projects from speculative ones, shrinking the effective queue.",
      "A faster, clearer answer — even a \"no\" — lets developers redirect capital away from stalled sites sooner.",
    ],
    weaknesses: [
      "Grid operators need real staffing and funding to run cluster studies competently; an underfunded ISO risks trading one bottleneck for another.",
      "\"Readiness\" criteria (site control, deposits, permits-in-hand) can be easier for well-capitalized developers to clear than smaller ones, even when the smaller project is otherwise sound.",
      "Doesn't by itself fix the underlying transmission capacity constraints that cause long queues in many regions in the first place.",
    ],
    bills: [
      {
        label: "FERC Order No. 2023 (interconnection queue reform)",
        url: "https://www.ferc.gov/explainer-interconnection-final-rule",
        note: "A FERC rule, not legislation — the reform is already final; the open question is full implementation across every regional grid operator.",
      },
      {
        label: "Congress.gov: bills on interconnection queue reform",
        url: billSearch("interconnection queue reform"),
      },
    ],
  },
  {
    slug: "environmental_review_nepa",
    title: "NEPA timeline & review reform",
    oneLiner: "Faster environmental reviews — same rigor, less duplication.",
    problem:
      "Federal environmental review under the National Environmental Policy Act (NEPA) has no hard deadline in practice for many projects, and agencies sometimes re-study effects that are already well understood from comparable past projects, or run reviews sequentially rather than in parallel — adding years without necessarily improving the environmental outcome.",
    proposal:
      "Enforceable timelines and page limits for environmental review documents (building on the 2023 amendments to NEPA), a single lead agency empowered to set and hold the overall schedule, and expanded categorical exclusions for project types and impacts that are already well understood from prior review.",
    strengths: [
      "Targets pace and duplication, not the substance of review — the same environmental questions still get answered, just on a schedule.",
      "Has a bipartisan track record: the 2023 NEPA timeline and page-limit amendments passed as part of a broadly bipartisan bill.",
      "Categorical exclusions can be added or narrowed based on evidence over time, not fixed once and forgotten.",
    ],
    weaknesses: [
      "Hard deadlines can pressure agencies to rush complex reviews or compress public comment periods.",
      "\"Well understood\" impacts is a judgment call that can be contested — a badly drawn categorical exclusion could let a genuinely harmful project skip real review.",
      "Timelines alone don't help much if the reviewing agencies are underfunded or understaffed to actually do the work faster without cutting corners.",
    ],
    bills: [
      {
        label: "Fiscal Responsibility Act of 2023 (H.R. 3746) — NEPA provisions",
        url: "https://www.congress.gov/bill/118th-congress/house-bill/3746",
        note: "Public Law 118-5. Enacted the current statutory NEPA page limits and review deadlines.",
      },
      {
        label: "Congress.gov: bills on NEPA / environmental review timelines",
        url: billSearch("NEPA environmental review timeline reform"),
      },
    ],
  },
  {
    slug: "multi_agency_permitting",
    title: "One Federal Decision / joint permitting review",
    oneLiner: "One coordinated review instead of a relay race between agencies.",
    problem:
      "A single project can need separate sign-off from several federal agencies — for example the Army Corps of Engineers for a Clean Water Act Section 404 permit and the Fish & Wildlife Service for an Endangered Species Act consultation — each running its own review on its own timeline, often one after another. A delay at any single agency delays the whole project, even if every other agency involved is ready to approve.",
    proposal:
      "A single coordinated schedule and one combined record of decision across every federal agency with permitting authority over a project — the \"One Federal Decision\" model already used for FAST-41 covered infrastructure projects — so reviews run in parallel on a shared, binding timeline instead of end to end.",
    strengths: [
      "Already proven at smaller scale under FAST-41 for covered projects; extending it is a matter of scope, not invention.",
      "Removes the \"weakest link\" dynamic where the single slowest agency sets the pace for every other agency's already-finished work.",
      "Keeps each agency's substantive review intact — it synchronizes the calendar, not the standards.",
    ],
    weaknesses: [
      "Coordinating agencies with different statutory deadlines, cultures, and resource levels is a genuine management challenge, not just a paperwork fix.",
      "A shared deadline can create pressure to rubber-stamp a slower agency's unfinished review rather than let it actually finish.",
      "Requires sustained interagency staffing and funding to run joint reviews well — without that, it's a schedule on paper only.",
    ],
    bills: [
      {
        label: "FAST Act of 2015 (H.R. 22), Title 41 — \"FAST-41\"",
        url: "https://www.congress.gov/bill/114th-congress/house-bill/22",
        note: "Public Law 114-94. Title 41 established the One Federal Decision / covered-project framework this policy would extend.",
      },
      {
        label: "Congress.gov: bills on federal permitting coordination",
        url: billSearch("one federal decision permitting coordination"),
      },
    ],
  },
  {
    slug: "transmission_siting_land_rights",
    title: "Federal backstop transmission siting authority",
    oneLiner: "A last-resort federal option when interstate transmission lines stall.",
    problem:
      "Unlike interstate natural gas pipelines, there is no federal backstop authority to site major interstate electric transmission lines. A line crossing several states needs separate approval from each one, and if a single state — or even one local jurisdiction within it — declines to act or say no, the whole project can be blocked, even a line widely judged to serve a clear regional or national need.",
    proposal:
      "Give a federal body (typically proposed as FERC) backstop siting authority for transmission lines designated as nationally significant, usable only when state-level review stalls, conflicts across states, or a state declines to act within a set time — modeled on the existing federal backstop for interstate natural gas pipelines under the Natural Gas Act.",
    strengths: [
      "A close legal and regulatory precedent already exists in interstate gas pipeline siting, so this isn't a novel expansion of federal power in kind, only in degree.",
      "Directly targets the single biggest reason large multi-state transmission projects stall: one state or locality effectively vetoing a project with regional or national benefits.",
      "Can be scoped narrowly — backstop-only, rarely invoked, after a defined state-review period has lapsed — to preserve normal state primacy in the typical case.",
    ],
    weaknesses: [
      "States and many local governments treat siting authority as a core sovereignty issue — this is the single most politically contested item in the federal permitting-reform agenda.",
      "A federal backstop could in principle override legitimate, well-founded local objections (real environmental, safety, or property concerns), not only parochial obstruction.",
      "\"National interest\" designation criteria need to be specific and well-enforced, or the backstop risks becoming a default path for any large transmission project rather than a true last resort.",
    ],
    bills: [
      {
        label: "Energy Permitting Reform Act of 2024 (S. 4753, 118th Congress)",
        url: "https://www.congress.gov/bill/118th-congress/senate-bill/4753",
        note: "Bipartisan bill from Sens. Manchin and Barrasso, advanced 15-4 out of the Senate Energy Committee in August 2024; includes transmission-reliability provisions relevant to this policy.",
      },
      {
        label: "Congress.gov: bills on federal transmission siting authority",
        url: billSearch("federal transmission siting authority"),
      },
    ],
  },
  {
    slug: "litigation_legal_challenge",
    title: "Judicial review reform",
    oneLiner: "Give court challenges to permits an actual end date.",
    problem:
      "Even after a project clears every regulatory approval, it can still be tied up for years in court challenges to that approval — with no deadline for filing a challenge, no consolidated venue, and no expedited schedule for deciding it. In effect, a project can be re-permitted through litigation long after every agency has signed off, with no legal finality even once approved.",
    proposal:
      "A defined statute of limitations for challenging an issued permit, a single consolidated court venue so the same approval isn't relitigated case by case across multiple circuits, and expedited briefing and decision schedules for infrastructure-permit appeals — so a legal challenge has a real end date instead of running indefinitely.",
    strengths: [
      "Doesn't remove anyone's right to challenge a permit in court — it puts a clock and a single venue on that right, not a bar on using it.",
      "Targets a form of delay that's largely uncorrelated with a project's underlying merit: a well-permitted project can be tied up by litigation just as easily as a poorly-permitted one.",
      "Comparable \"shot clock\" provisions already exist for FAST-41 covered projects, so this extends a working model rather than inventing one.",
    ],
    weaknesses: [
      "Litigation is often the main real check on agencies that under-comply with environmental or procedural law — tightening it broadly can weaken that check for a good-faith case along with a bad-faith delay tactic.",
      "Consolidating venue can disadvantage plaintiffs by moving cases away from the courts most familiar with local facts and precedent.",
      "A statute of limitations that's too short can bar meritorious claims based on harms only discovered after construction has visibly begun.",
    ],
    bills: [
      {
        label: "Energy Permitting Reform Act of 2024 (S. 4753, 118th Congress)",
        url: "https://www.congress.gov/bill/118th-congress/senate-bill/4753",
        note: "Bipartisan bill from Sens. Manchin and Barrasso; its title covers judicial review reform for covered energy projects among other permitting provisions.",
      },
      {
        label: "Congress.gov: bills on judicial review of permits",
        url: billSearch("judicial review permit litigation reform"),
      },
    ],
  },
  {
    slug: "local_state_opposition",
    title: "Earlier, more meaningful community engagement",
    oneLiner: "Bring communities in before the fight, not after.",
    problem:
      "Local and state opposition — a zoning denial, a countywide moratorium, a ballot measure — often surfaces only after a project is already far along, once a developer has sunk costs into a specific site and design. By that point, residents frequently feel like they're being presented with a done deal rather than genuinely consulted, which turns a solvable disagreement into an all-or-nothing fight.",
    proposal:
      "Require meaningful, adequately resourced local engagement earlier in project development — before the site and design are effectively locked in — paired with community benefit agreements that share concrete, binding local value (tax revenue, jobs, infrastructure investment) in exchange for hosting a project.",
    strengths: [
      "Addresses a real root cause of a lot of local opposition — feeling shut out and getting nothing tangible in return — rather than just the symptom of a late-stage zoning fight.",
      "Community benefit agreements are already a proven, voluntarily-used tool for many developers; this would make early, genuine engagement closer to standard practice instead of optional best practice.",
      "Can reduce downstream litigation risk too, since better-negotiated projects tend to draw fewer legal challenges from the same local opponents.",
    ],
    weaknesses: [
      "\"Meaningful engagement\" is hard to define or enforce in statute — a check-the-box public meeting could technically satisfy a requirement without its underlying intent.",
      "Earlier engagement adds real time and cost to project development up front, which developers may resist even when it saves time later.",
      "Community benefit agreements can end up shaped mainly by whichever local stakeholders are best organized or resourced, not necessarily those most directly affected.",
    ],
    bills: [
      {
        label: "Congress.gov: bills on community benefit agreements / early siting engagement",
        url: billSearch("community benefit agreement energy project siting"),
      },
    ],
  },
];

export const POLICY_BY_SLUG: Record<CauseSlug, Policy | undefined> =
  Object.fromEntries(POLICIES.map((p) => [p.slug, p])) as Record<
    CauseSlug,
    Policy | undefined
  >;

export function getPolicy(slug: string): Policy | undefined {
  return POLICY_BY_SLUG[slug as CauseSlug];
}
