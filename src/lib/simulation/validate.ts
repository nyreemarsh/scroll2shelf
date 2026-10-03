import {
  getProduct,
  MISSION_COURSES,
  productsForCourse,
  type Course,
} from "@/lib/catalogue";
import { MODEL_CONFIG } from "./config";
import type { SimulationSummary } from "./types";

/**
 * Checks the simulation against the things we actually observed, so a claim in
 * the UI can be read next to how well the model reproduces reality.
 *
 * Nothing here feeds back into the engine automatically. It is a scoreboard:
 * `MODEL_CONFIG` is tuned by hand against these numbers, and anything that
 * rests on a handful of observations is flagged rather than quietly reported.
 */

/** The slice of `evidence.json` this module reads. */
export interface ValidationEvidence {
  courseParticipation: Record<string, number>;
  lopsidedShare: number;
  lopsidedSample: number;
  observedRounds: {
    course: string;
    /** Null where the product on screen could not be matched to the catalogue. */
    productId: string | null;
    priceSeen: number | null;
  }[];
}

export interface Comparison {
  simulated: number;
  observed: number;
  /** Simulated minus observed. Positive means the model overshoots. */
  diff: number;
}

export interface CourseParticipationCheck extends Comparison {
  course: Course;
}

export interface PriceCheck extends Comparison {
  course: Course;
  /** Observed rounds that recorded a price. Single digits for every course. */
  observations: number;
}

export interface LopsidedCheck extends Comparison {
  sample: number;
  smallSample: boolean;
}

export interface ProductHitRate {
  /** Depth of the simulated ranking a product counts as a hit in. */
  depth: number;
  /** Observed rounds scored — those whose product is in the catalogue. */
  rounds: number;
  /** Rounds skipped because the product never made the 240-product catalogue. */
  unmatchedRounds: number;
  inTop: number;
  inTopShare: number;
  isTopPick: number;
  isTopPickShare: number;
  /**
   * What `inTopShare` would be if the model ranked at random — showing the
   * ranking's depth against its course's shelf. A hit rate near this number
   * means the model has not yet earned a product-level claim.
   */
  chanceBaseline: number;
  /**
   * Rounds where the sample filed the product under a different course than the
   * catalogue does — halloumi fries played as a starter, shelved as a side.
   * Scored against the catalogue's course, since that is the only shelf the
   * simulation could ever draw it from.
   */
  courseRecoded: number;
}

export interface Validation {
  courseParticipation: CourseParticipationCheck[];
  productHitRate: ProductHitRate;
  lopsided: LopsidedCheck;
  pricePerCourse: PriceCheck[];
}

function compare(simulated: number, observed: number): Comparison {
  return { simulated, observed, diff: simulated - observed };
}

/**
 * Mean price paid for a course on the nights it was played. `categorySpend` is
 * averaged over every night including the ones that skipped the course, so
 * dividing by the attach rate takes it back to a per-purchase figure.
 */
function meanPricePaid(summary: SimulationSummary, course: Course): number {
  const spend =
    summary.categorySpend.find((entry) => entry.course === course)?.spend ?? 0;
  const attach = summary.attachRates[course] ?? 0;
  return attach > 0 ? spend / attach : 0;
}

function participationChecks(
  summary: SimulationSummary,
  evidence: ValidationEvidence,
): CourseParticipationCheck[] {
  return MISSION_COURSES.map((course) => ({
    course,
    ...compare(
      summary.courseParticipation[course] ?? 0,
      evidence.courseParticipation[course] ?? 0,
    ),
  }));
}

function productHitRate(
  summary: SimulationSummary,
  evidence: ValidationEvidence,
): ProductHitRate {
  const depth = MODEL_CONFIG.topProductsPerCourse;

  let rounds = 0;
  let unmatchedRounds = 0;
  let inTop = 0;
  let isTopPick = 0;
  let courseRecoded = 0;
  let chance = 0;

  for (const round of evidence.observedRounds) {
    const product = round.productId ? getProduct(round.productId) : undefined;
    if (!product) {
      unmatchedRounds += 1;
      continue;
    }

    rounds += 1;
    if (product.course !== round.course) courseRecoded += 1;

    const shelf = productsForCourse(product.course).length;
    if (shelf > 0) chance += Math.min(depth, shelf) / shelf;

    const ranked = summary.topByCourse[product.course] ?? [];
    const position = ranked.findIndex(
      (entry) => entry.product.id === product.id,
    );
    if (position >= 0 && position < depth) inTop += 1;
    if (position === 0) isTopPick += 1;
  }

  return {
    depth,
    rounds,
    unmatchedRounds,
    inTop,
    inTopShare: rounds > 0 ? inTop / rounds : 0,
    isTopPick,
    isTopPickShare: rounds > 0 ? isTopPick / rounds : 0,
    chanceBaseline: rounds > 0 ? chance / rounds : 0,
    courseRecoded,
  };
}

function lopsidedCheck(
  summary: SimulationSummary,
  evidence: ValidationEvidence,
): LopsidedCheck {
  return {
    ...compare(summary.lopsidedShare, evidence.lopsidedShare),
    sample: evidence.lopsidedSample,
    smallSample: evidence.lopsidedSample < MODEL_CONFIG.smallSampleBelow,
  };
}

function priceChecks(
  summary: SimulationSummary,
  evidence: ValidationEvidence,
): PriceCheck[] {
  const seen = new Map<Course, { total: number; count: number }>();

  for (const round of evidence.observedRounds) {
    if (round.priceSeen === null) continue;
    const product = round.productId ? getProduct(round.productId) : undefined;
    const course = (product?.course ?? round.course) as Course;
    if (!MISSION_COURSES.includes(course)) continue;

    const entry = seen.get(course) ?? { total: 0, count: 0 };
    entry.total += round.priceSeen;
    entry.count += 1;
    seen.set(course, entry);
  }

  return MISSION_COURSES.filter((course) => seen.has(course)).map((course) => {
    const entry = seen.get(course);
    const observed = entry ? entry.total / entry.count : 0;
    return {
      course,
      observations: entry?.count ?? 0,
      ...compare(meanPricePaid(summary, course), observed),
    };
  });
}

export function validate(
  summary: SimulationSummary,
  evidence: ValidationEvidence,
): Validation {
  return {
    courseParticipation: participationChecks(summary, evidence),
    productHitRate: productHitRate(summary, evidence),
    lopsided: lopsidedCheck(summary, evidence),
    pricePerCourse: priceChecks(summary, evidence),
  };
}
