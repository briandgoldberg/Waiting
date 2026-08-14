// The fixed set of causal categories every tracked project's delay is mapped
// to. This is the single source of truth for cause-category metadata across
// the app — the database only stores the `slug` on each project (see
// prisma/schema.prisma).
//
// Kept intentionally small and stable: adding a category is a product/policy
// decision, not something ingestion scripts should be able to do silently.
//
// Note: this module used to pair each cause 1:1 with a single named "reform
// lever" (shown on both project pages and a /reform/[slug] page per cause).
// That's been replaced by a separate, more complete policy landscape at
// /policies (see src/lib/data/policies.ts) — a cause here is just "why a
// project is stuck," not an implied specific bill to support.

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
    color: "#2563eb",
  },
  {
    slug: "environmental_review_nepa",
    label: "Environmental review timeline (NEPA)",
    shortLabel: "NEPA review",
    description:
      "The project is in federal environmental review under the National Environmental Policy Act (NEPA), which requires agencies to study a project's environmental effects — and reasonable alternatives — before approving it.",
    color: "#16a34a",
  },
  {
    slug: "multi_agency_permitting",
    label: "Multi-agency permitting",
    shortLabel: "Multi-agency permits",
    description:
      "The project needs sign-off from multiple federal agencies — for example a Clean Water Act Section 404 permit from the Army Corps of Engineers and an Endangered Species Act consultation with Fish & Wildlife — running as separate, uncoordinated processes rather than one review.",
    color: "#d97706",
  },
  {
    slug: "transmission_siting_land_rights",
    label: "Transmission siting & land rights",
    shortLabel: "Transmission siting",
    description:
      "The project can't get siting approval or secure right-of-way across state, federal, or private land — often because it crosses multiple states with different siting authorities and no single body can approve the full route.",
    color: "#7c3aed",
  },
  {
    slug: "litigation_legal_challenge",
    label: "Litigation / legal challenge",
    shortLabel: "Litigation",
    description:
      "The project has been approved but is facing a court challenge to that approval, or its realistic timeline has to include the litigation risk that comes standard with major energy infrastructure permits today.",
    color: "#dc2626",
  },
  {
    slug: "local_state_opposition",
    label: "Local/state opposition",
    shortLabel: "Local opposition",
    description:
      "A local government, county board, ballot measure, or state-level action has blocked or is blocking the project — for example a zoning denial or a countywide moratorium on a technology type.",
    color: "#0891b2",
  },
  {
    slug: "financing_supply_chain_other",
    label: "Financing / supply chain / other",
    shortLabel: "Financing / supply chain",
    description:
      "The delay is not a regulatory bottleneck — it's driven by financing conditions (interest rates, loan terms), supply chain constraints (turbines, transformers, specialized vessels), or other non-permitting factors.",
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
