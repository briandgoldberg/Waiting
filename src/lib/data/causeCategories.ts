// The fixed set of causal categories every tracked project's delay is mapped
// to, and the specific reform proposal paired with each one. This is the
// single source of truth for cause-category metadata across the app — the
// database only stores the `slug` on each project (see prisma/schema.prisma).
//
// Kept intentionally small and stable: adding a category is a product/policy
// decision, not something ingestion scripts should be able to do silently.

export type CauseSlug =
  | "interconnection_queue_backlog"
  | "environmental_review_nepa"
  | "multi_agency_permitting"
  | "transmission_siting_land_rights"
  | "litigation_legal_challenge"
  | "local_state_opposition"
  | "financing_supply_chain_other";

export interface CauseCategory {
  slug: CauseSlug;
  label: string;
  shortLabel: string;
  /** Neutral, factual description of the bottleneck itself. */
  description: string;
  /** Named reform lever this category argues for. */
  reformLever: string;
  /** Longer, bipartisan-toned explanation for the reform explainer page. */
  reformDescription: string;
  /** Color used consistently for map pins, chips, and charts. */
  color: string;
  /**
   * If true, this category is deliberately excluded from the site's
   * "permitting reform would fix this" argument and shown as a control
   * group instead — see README "Positioning" notes.
   */
  isControlGroup?: boolean;
}

export const CAUSE_CATEGORIES: CauseCategory[] = [
  {
    slug: "interconnection_queue_backlog",
    label: "Interconnection queue backlog",
    shortLabel: "Interconnection queue",
    description:
      "The project is stuck waiting on a grid operator or independent system operator (ISO) to complete its interconnection study — the technical review that determines what grid upgrades are needed before a project can connect.",
    reformLever: "Interconnection process reform",
    reformDescription:
      "FERC Order 2023 requires grid operators to move from one-at-a-time, first-come-first-served interconnection studies to \"first-ready, first-served\" cluster studies, with defined study deadlines and financial commitments that discourage speculative applications from clogging the queue. Full implementation across all regional grid operators — and enforcement of the deadlines — is the core ask here.",
    color: "#2563eb",
  },
  {
    slug: "environmental_review_nepa",
    label: "Environmental review timeline (NEPA)",
    shortLabel: "NEPA review",
    description:
      "The project is in federal environmental review under the National Environmental Policy Act (NEPA), which requires agencies to study a project's environmental effects — and reasonable alternatives — before approving it.",
    reformLever: "NEPA timeline & page-limit reform",
    reformDescription:
      "Statutory page limits and firm deadlines for environmental reviews (as amended by the Fiscal Responsibility Act of 2023), a single lead agency to coordinate the review instead of several agencies running parallel processes, and expanded use of categorical exclusions for projects with well-understood, minor environmental effects.",
    color: "#16a34a",
  },
  {
    slug: "multi_agency_permitting",
    label: "Multi-agency permitting",
    shortLabel: "Multi-agency permits",
    description:
      "The project needs sign-off from multiple federal agencies — for example a Clean Water Act Section 404 permit from the Army Corps of Engineers and an Endangered Species Act consultation with Fish & Wildlife — running as separate, uncoordinated processes rather than one review.",
    reformLever: "One Federal Decision / joint permitting review",
    reformDescription:
      "Modeled on the FAST-41 \"One Federal Decision\" framework: a single coordinated schedule and record of decision across every federal agency with a permitting role in a project, so approvals happen in parallel on a shared timeline instead of sequentially with no coordination.",
    color: "#d97706",
  },
  {
    slug: "transmission_siting_land_rights",
    label: "Transmission siting & land rights",
    shortLabel: "Transmission siting",
    description:
      "The project can't get siting approval or secure right-of-way across state, federal, or private land — often because it crosses multiple states with different siting authorities and no single body can approve the full route.",
    reformLever: "Federal backstop transmission siting authority",
    reformDescription:
      "A federal backstop siting authority (similar to what exists for interstate natural gas pipelines) that can approve routes for high-voltage transmission lines designated as being in the national interest, when state-by-state approval processes stall or conflict with each other.",
    color: "#7c3aed",
  },
  {
    slug: "litigation_legal_challenge",
    label: "Litigation / legal challenge",
    shortLabel: "Litigation",
    description:
      "The project has been approved but is facing a court challenge to that approval, or its realistic timeline has to include the litigation risk that comes standard with major energy infrastructure permits today.",
    reformLever: "Judicial review reform",
    reformDescription:
      "A defined statute of limitations for challenging a permit after it's issued, consolidated venue rules so the same approval isn't relitigated in multiple circuits, and expedited briefing/decision schedules for infrastructure-permit appeals — so litigation has an end date instead of running indefinitely.",
    color: "#dc2626",
  },
  {
    slug: "local_state_opposition",
    label: "Local/state opposition",
    shortLabel: "Local opposition",
    description:
      "A local government, county board, ballot measure, or state-level action has blocked or is blocking the project — for example a zoning denial or a countywide moratorium on a technology type.",
    reformLever: "Community benefit agreements & earlier engagement",
    reformDescription:
      "Requiring meaningful, well-funded local engagement earlier in project development — before a proposal is far enough along that opposition becomes an all-or-nothing fight — paired with community benefit agreements that share concrete local value (tax revenue, jobs, infrastructure) for hosting a project.",
    color: "#0891b2",
  },
  {
    slug: "financing_supply_chain_other",
    label: "Financing / supply chain / other",
    shortLabel: "Financing / supply chain",
    description:
      "The delay is not a regulatory bottleneck — it's driven by financing conditions (interest rates, loan terms), supply chain constraints (turbines, transformers, specialized vessels), or other non-permitting factors.",
    reformLever: "Tracked for context — not part of the reform argument",
    reformDescription:
      "This category is tracked deliberately so the site doesn't imply every delayed project would be fixed by permitting reform. It's shown as a control group: projects delayed or cancelled for reasons permitting reform wouldn't touch, which is itself useful context for how much of the \"waiting\" problem is regulatory versus not.",
    color: "#6b7280",
    isControlGroup: true,
  },
];

export const CAUSE_CATEGORY_BY_SLUG: Record<CauseSlug, CauseCategory> =
  Object.fromEntries(CAUSE_CATEGORIES.map((c) => [c.slug, c])) as Record<
    CauseSlug,
    CauseCategory
  >;

export function getCauseCategory(slug: string): CauseCategory | undefined {
  return CAUSE_CATEGORY_BY_SLUG[slug as CauseSlug];
}

export const REFORM_CAUSE_CATEGORIES = CAUSE_CATEGORIES.filter(
  (c) => !c.isControlGroup,
);
