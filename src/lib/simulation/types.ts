import type { CatalogueProduct, Course } from "@/lib/catalogue";

export type Move = "rock" | "paper" | "scissors";

export type ShopperId = "a" | "b";

export interface Persona {
  id: string;
  name: string;
  tagline: string;
  budget: number;
  noveltySeeking: number;
  indulgence: number;
  priceSensitivity: number;
  trendAffinity: number;
  premiumPreference: number;
  healthOrientation: number;
}

export interface Candidate {
  product: CatalogueProduct;
  probability: number;
  /** Top scoring contributors, used to explain the pick. */
  reasons: { label: string; weight: number }[];
}

export type DecisionStyleId = "even" | "lopsided" | "joint";

/**
 * The engine-facing form of the retailer's parameters. Built by
 * `resolveParameters`; the engine never reads `SimulationParameters` directly.
 */
export interface ModelSettings {
  courses: Course[];
  /** Multipliers on each scoring weight in `MODEL_CONFIG.weights`. */
  weightScale: {
    novelty: number;
    indulgence: number;
    viralPotential: number;
    premium: number;
    dateNight: number;
    health: number;
  };
  priceSensitivityScale: number;
  /** 0–1 weight on the product's observed TikTok signal. */
  trendExposure: number;
  /** Budget for the night in £. The basket is shared, so the gate is too. */
  budget: number;
  decisionStyle: DecisionStyleId;
  /** Tag to filter on, and the courses with a big enough tagged pool. */
  dietary: { tag: string; courses: Course[] } | null;
  /**
   * Probability each course is played on a given night. Starts as the observed
   * rate from the TikTok sample; an intervention is nothing more than a change
   * to one of these numbers.
   */
  courseParticipation: Record<Course, number>;
}

export type InterventionId = "wildcard-display" | "drink-pairing";

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
  /** True when both shoppers' preferences were blended into one shortlist. */
  decidedJointly: boolean;
  /** Ranked candidates per shopper for this course. */
  suggestions: Record<ShopperId, Candidate[]>;
  chosen: Candidate;
  runningTotal: number;
}

export interface MissionResult {
  rounds: RoundResult[];
  total: number;
}

export interface SimulationSummary {
  runs: number;
  averageBasket: number;
  medianBasket: number;
  histogram: { bucket: string; count: number }[];
  topByCourse: Record<Course, { product: CatalogueProduct; share: number }[]>;
  categorySpend: { course: Course; spend: number }[];
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
