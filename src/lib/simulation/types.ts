import type { CatalogueProduct, Course } from "@/lib/catalogue";
import type { MealAddition } from "./meal";

export type Move = "rock" | "paper" | "scissors";

export type ShopperId = "a" | "b";

export type HealthGoal = "balanced" | "protein" | "vegetables" | "less-sugar";

/** The nine editable preference controls in the two-hour prototype. */
export interface ShopperPreferences {
  priceSensitivity: number;
  treatAppetite: number;
  flavourBoldness: number;
  noveltySeeking: number;
  trendAffinity: number;
  healthOrientation: number;
  healthGoal: HealthGoal;
  easePreference: number;
  sustainabilityPriority: number;
  wasteAvoidance: number;
}

export interface Persona extends ShopperPreferences {
  id: string;
  name: string;
  tagline: string;
  budget: number;
  noveltySeeking: number;
}

export interface Candidate {
  product: CatalogueProduct;
  probability: number;
  /** Top scoring contributors, used to explain the pick. */
  reasons: { label: string; weight: number }[];
}

/**
 * The engine-facing form of the retailer's parameters. Built by
 * `resolveParameters`; the engine never reads `SimulationParameters` directly.
 */
export interface ModelSettings {
  courses: Course[];
  /** Soft shared budget: the model may exceed it and reports when it does. */
  budget: number;
  couple: {
    compromise: number;
    winnerControl: number;
    budgetFlexibility: number;
    sharingPreference: number;
  };
  aisleExperiment: {
    enabled: boolean;
    aisleA: string;
    aisleB: string;
    /** Additive utility bonus once the basket contains the paired aisle. */
    effect: number;
  };
  /**
   * Observed prior for each course. The engine combines it with both personas'
   * visible preferences before deciding whether that course belongs in a shop.
   */
  courseParticipation: Record<Course, number>;
}

export type InterventionId = "aisle-colocation";

/**
 * A retailer action, expressed only as a change to the run's parameters. The
 * uplift it produces is whatever the simulation returns — no intervention
 * carries a result, just the assumption it rests on.
 */
export interface Intervention {
  id: InterventionId;
  label: string;
  /** The uptake assumption in words, e.g. "uptake rises from 9% to 35%". */
  assumption: string;
}

export interface InterventionComparison {
  intervention: Intervention;
  baseline: SimulationSummary;
  withIntervention: SimulationSummary;
  /** Change in the average simulated basket, in £. */
  upliftAbs: number;
  /**
   * The same change as a fraction of the baseline basket, so 0.054 is +5.4%.
   * A fraction like every other rate here; the UI multiplies by 100.
   */
  upliftPct: number;
}

export interface RoundResult {
  index: number;
  course: Course;
  /** More than one entry means the round was drawn and replayed. */
  throws: { a: Move; b: Move }[];
  winner: ShopperId;
  /** True when compromise leaves both partners with effectively equal say. */
  decidedJointly: boolean;
  winnerInfluence: number;
  /** Ranked candidates per shopper for this course. */
  suggestions: Record<ShopperId, Candidate[]>;
  chosen: Candidate;
  additions: MealAddition[];
  closeAlternative: Candidate | null;
  runningTotal: number;
}

export interface CourseDecision {
  course: Course;
  selected: boolean;
  /** Persona-led likelihood that this course belongs in the basket. */
  probability: number;
  /** Plain-language explanation shown in the walkthrough and results. */
  reason: string;
}

export interface MissionResult {
  rounds: RoundResult[];
  courseDecisions: CourseDecision[];
  total: number;
  unavailableCourses: Course[];
}

export interface SimulationSummary {
  runs: number;
  averageBasket: number;
  medianBasket: number;
  minBasket: number;
  maxBasket: number;
  overBudgetRate: number;
  averageOverspend: number;
  histogram: { bucket: string; count: number }[];
  topByCourse: Record<Course, { product: CatalogueProduct; share: number }[]>;
  categorySpend: { course: Course; spend: number }[];
  commonPairings: {
    products: [CatalogueProduct, CatalogueProduct];
    share: number;
  }[];
  commonBaskets: { products: CatalogueProduct[]; share: number }[];
  /**
   * Share of simulated nights where the couple reached for the course, before
   * the budget gate. Comparable with `evidence.courseParticipation`.
   */
  courseParticipation: Record<Course, number>;
  /**
   * Share of simulated nights where the course was played *and* a product went
   * into the basket — participation less the nights the winner could not afford
   * anything on their shortlist.
   */
  attachRates: Record<Course, number>;
  premiumShare: number;
  /**
   * Share of nights where one shopper won at least `MODEL_CONFIG.lopsidedWinGap`
   * more rounds than the other, counting only the rounds that were played.
   */
  lopsidedShare: number;
  /**
   * Hash of every rock-paper-scissors throw the run played. Not shown anywhere;
   * it exists so the checks can prove two runs with the same seed saw identical
   * throws, which is what makes a baseline and an intervention comparable.
   */
  throwsFingerprint: number;
}

export interface MissionOptions {
  seed: number;
  settings: ModelSettings;
  /** Applied on top of `settings` before the run; defaults to none. */
  interventions?: Intervention[];
}

export interface MonteCarloOptions extends MissionOptions {
  runs: number;
}

export interface CompareInterventionOptions {
  seed: number;
  runs: number;
  settings: ModelSettings;
  intervention: Intervention;
}
