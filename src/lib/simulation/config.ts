import evidence from "@/data/evidence.json";
import type { Course } from "@/lib/catalogue";

/**
 * Every tunable number the simulation uses. `engine.ts` reads its constants from
 * here and nowhere else, so each figure on screen can be traced back to one of
 * two provenances:
 *
 * - DATA       — measured, either from the hand-coded TikTok sample in
 *                `evidence.json` or from the M&S catalogue in `products.json`.
 * - ASSUMPTION — hand-set by us. These are the dials; everything else follows.
 *
 * Assumptions are tuned against `validate.ts`, never against a target headline.
 */
export const MODEL_CONFIG = {
  /**
   * ASSUMPTION — softmax temperature. Product scores only span ~0.7, so the
   * brief's 0.35 flattened the distribution to ~8% on the top pick and made
   * every persona behave identically. Raise it to soften the picks again.
   */
  temperature: 0.15,

  /**
   * ASSUMPTION — weight on each positive scoring term. A persona trait times a
   * product attribute is already 0–1, so a weight of 1 means "count this term
   * at face value". Two weights are deliberately off 1:
   *
   * - `tiktok` multiplies `product.trendSignal`, which is measured — how often
   *   couples were actually filmed buying the product. It is the one term the
   *   retailer can turn up, via the trend-exposure dial.
   * - `viralPotential` multiplies a catalogue attribute scored by heuristic, so
   *   it stays as a smaller hunch term behind the measured signal.
   *
   * `dateNight` has no matching persona trait: it is a flat context bonus for
   * romantic products, so it carries its own weight.
   *
   * `premium` is 0.4 rather than 1 because at full weight the model shopped
   * dearer than the couples in the sample did — around £2 a course over the
   * prices they were seen paying — and dropping it lifted the held-out product
   * hit rate at every TikTok weight tried. `tiktok` is left at 1: raising it
   * improves the hit rate only because that metric is scored on the same posts
   * the signal is built from, so the gain is leakage rather than accuracy.
   */
  weights: {
    novelty: 1,
    indulgence: 1,
    tiktok: 1,
    viralPotential: 0.5,
    premium: 0.4,
    dateNight: 0.3,
    health: 1,
  },

  /**
   * ASSUMPTION — how hard a product is penalised for pushing the winner past
   * their budget. `floor` is the share of the penalty that applies even to a
   * shopper with zero price sensitivity.
   */
  budgetPenalty: {
    weight: 1.5,
    floor: 0.5,
  },

  /**
   * ASSUMPTION — shoppers weigh a shortlist, not all 40 products in a course.
   * Without this the softmax spreads over the whole shelf and the sampled pick
   * is usually a long-tail product with a ~2% match.
   */
  considerationSet: 10,

  /** ASSUMPTION — how many ranked candidates per shopper the UI carousel shows. */
  suggestionsPerShopper: 5,

  /** ASSUMPTION — how many scoring terms the "why" explanation lists, and the
   * contribution below which a term is too small to be worth naming. */
  reasonsShown: 4,
  reasonFloor: 0.01,

  /** ASSUMPTION — 0.7 splits the catalogue roughly in half, so the share is informative. */
  premiumThreshold: 0.7,

  /** ASSUMPTION — a drawn round is replayed; this only guards a pathological stream. */
  maxThrows: 10,

  /** ASSUMPTION — basket histogram shape, in £ per bucket and buckets across. */
  histogram: {
    bucketWidth: 5,
    targetBuckets: 12,
  },

  /**
   * ASSUMPTION — how many products per course the summary ranks. 10 is the
   * depth `validate.ts` measures the product hit rate at; the UI slices this
   * down to the handful it has room for.
   */
  topProductsPerCourse: 10,

  /**
   * DATA — a night counts as lopsided when one shopper wins this many more
   * rounds than the other. Matches how the TikTok sample was coded, so
   * `evidence.lopsidedShare` and the simulated share measure the same thing.
   */
  lopsidedWinGap: 2,

  /** ASSUMPTION — below this many observations a comparison is flagged thin. */
  smallSampleBelow: 30,

  /**
   * DATA — share of the 22 TikTok posts that played each course
   * (`evidence.courseParticipation`). Used directly as the per-night
   * probability that a course gets played at all.
   */
  courseParticipation: evidence.courseParticipation as Record<Course, number>,

  /**
   * DATA — these three were played in every post in the sample, so they are
   * never rolled for. Listing them makes the 1.0 above explicit rather than
   * leaving it to a probability that happens to always pass.
   */
  alwaysPlayedCourses: ["starter", "main", "dessert"] as Course[],

  /**
   * ASSUMPTION — the uptake each intervention is assumed to reach. The uplift
   * these produce is whatever the simulation returns; only the uptake is set
   * here, and it is reported alongside the result as an assumption.
   */
  interventions: {
    wildcardUptake: 0.35,
    drinkUptake: 0.75,
  },
} as const;
