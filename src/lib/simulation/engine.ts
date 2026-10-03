import { MISSION_COURSES, type CatalogueProduct, type Course } from "@/lib/catalogue";
import { MODEL_CONFIG } from "./config";
import {
  applyInterventions,
  LOPSIDED_WIN_RATE,
  withInterventionCourses,
} from "./parameters";
import { hashInts, STREAM, streamFor, type Rng } from "./random";
import {
  cheapestPrice,
  considerationSet,
  poolFor,
  reasonsFor,
  sampleIndex,
  topCandidates,
  type ConsiderationSet,
} from "./scoring";
import type {
  Candidate,
  CompareInterventionOptions,
  InterventionComparison,
  MissionOptions,
  MissionResult,
  ModelSettings,
  MonteCarloOptions,
  Move,
  Persona,
  RoundResult,
  ShopperId,
  SimulationSummary,
} from "./types";

const MOVES: Move[] = ["rock", "paper", "scissors"];
const BEATS: Record<Move, Move> = {
  rock: "scissors",
  paper: "rock",
  scissors: "paper",
};

/**
 * The walkthrough in the simulate step is night 0 of the same Monte Carlo, so
 * the single mission a viewer watches is genuinely one of the runs behind the
 * aggregate numbers rather than a separate draw.
 */
const WALKTHROUGH_NIGHT = 0;

/** The three draw sequences one night needs, keyed off (seed, night). */
function streamsFor(seed: number, night: number) {
  return {
    throws: streamFor(seed, night, STREAM.throws),
    participation: streamFor(seed, night, STREAM.participation),
    products: streamFor(seed, night, STREAM.products),
  };
}

/**
 * Rolls every throw of a round into a running hash. Two runs with the same seed
 * must end on the same value, which is how the checks prove an intervention
 * changed only a threshold and not the random draws.
 */
function fingerprintThrows(
  current: number,
  throws: { a: Move; b: Move }[],
): number {
  let hash = current;
  for (const pair of throws) {
    hash = hashInts(hash, MOVES.indexOf(pair.a), MOVES.indexOf(pair.b));
  }
  return hash;
}

function decideThrow(a: Move, b: Move): ShopperId | null {
  if (a === b) return null;
  return BEATS[a] === b ? "a" : "b";
}

/**
 * Throws until someone wins, replaying genuine draws.
 *
 * In lopsided mode a favoured shopper is drawn first; if the deciding throw
 * went the other way the two hands are swapped rather than replayed. The pair
 * of hands on screen always produces the winner on screen, and every replay in
 * `throws` is a real draw — the animation can't contradict the result.
 */
function playRound(
  rng: Rng,
  settings: ModelSettings,
): Pick<RoundResult, "throws" | "winner"> {
  // Drawn on every round, played or not, so the stream stays aligned when the
  // decision style changes between runs.
  const bias = rng();
  const target: ShopperId | null =
    settings.decisionStyle === "lopsided"
      ? bias < LOPSIDED_WIN_RATE
        ? "a"
        : "b"
      : null;

  const throws: { a: Move; b: Move }[] = [];
  for (let attempt = 0; attempt < MODEL_CONFIG.maxThrows; attempt += 1) {
    const a = MOVES[Math.floor(rng() * MOVES.length)];
    const b = MOVES[Math.floor(rng() * MOVES.length)];

    const winner = decideThrow(a, b);
    if (!winner) {
      throws.push({ a, b });
      continue;
    }

    if (target && winner !== target) {
      throws.push({ a: b, b: a });
      return { throws, winner: target };
    }

    throws.push({ a, b });
    return { throws, winner };
  }
  return { throws, winner: target ?? "a" };
}

/** Starter, main and dessert were played in every post; the rest are rolled for. */
function isOptional(course: Course): boolean {
  return !MODEL_CONFIG.alwaysPlayedCourses.includes(course);
}

/**
 * Whether tonight's couple reaches for an optional course, rolled against the
 * rate it is played at — the observed share of TikTok posts, unless an
 * intervention has raised it.
 */
function rollsCourse(
  course: Course,
  draw: number,
  settings: ModelSettings,
): boolean {
  if (!isOptional(course)) return true;
  return draw < (settings.courseParticipation[course] ?? 0);
}

/**
 * The budget gate on optional courses: a couple still skips a round when what
 * is left of the night's budget will not cover even the cheapest thing on the
 * shortlist.
 */
function canAffordCourse(
  course: Course,
  set: ConsiderationSet,
  runningTotal: number,
  settings: ModelSettings,
): boolean {
  if (isOptional(course)) {
    return settings.budget - runningTotal >= cheapestPrice(set.products);
  }
  return true;
}

function personaFor(a: Persona, b: Persona, shopper: ShopperId): Persona {
  return shopper === "a" ? a : b;
}

/** Who gets a say in the pick — the round winner, or both when decided jointly. */
function decidersFor(
  a: Persona,
  b: Persona,
  winner: ShopperId,
  settings: ModelSettings,
): Persona[] {
  return settings.decisionStyle === "joint"
    ? [a, b]
    : [personaFor(a, b, winner)];
}

export function simulateMission(
  a: Persona,
  b: Persona,
  opts: MissionOptions,
): MissionResult {
  const settings = applyInterventions(opts.settings, opts.interventions ?? []);
  const rng = streamsFor(opts.seed, WALKTHROUGH_NIGHT);
  const shortlistSize = MODEL_CONFIG.suggestionsPerShopper;
  const decidedJointly = settings.decisionStyle === "joint";
  const rounds: RoundResult[] = [];
  let runningTotal = 0;

  settings.courses.forEach((course, index) => {
    const products = poolFor(course, settings);
    if (products.length === 0) return;

    // Every course draws from all three streams whether or not it ends up
    // played, so the streams stay aligned when participation changes.
    const { throws, winner } = playRound(rng.throws, settings);
    const participationDraw = rng.participation();
    const productDraw = rng.products();

    const deciders = decidersFor(a, b, winner, settings);
    const setA = considerationSet(
      decidedJointly ? deciders : [a],
      products,
      runningTotal,
      settings.budget,
      settings,
    );
    const setB = decidedJointly
      ? setA
      : considerationSet([b], products, runningTotal, settings.budget, settings);
    const decidingSet = decidedJointly ? setA : winner === "a" ? setA : setB;

    if (!rollsCourse(course, participationDraw, settings)) return;
    if (!canAffordCourse(course, decidingSet, runningTotal, settings)) return;

    const suggestions: Record<ShopperId, Candidate[]> = {
      a: topCandidates(decidedJointly ? deciders : [a], setA, settings, shortlistSize),
      b: topCandidates(decidedJointly ? deciders : [b], setB, settings, shortlistSize),
    };

    const pickedIndex = sampleIndex(decidingSet.probabilities, productDraw);
    const product = decidingSet.products[pickedIndex];
    const chosen: Candidate = {
      product,
      probability: decidingSet.probabilities[pickedIndex],
      reasons: reasonsFor(deciders, product, settings),
    };

    // The shelf highlights the chosen card, so it has to be on screen even when
    // the sample lands outside the shortlist the UI shows.
    for (const shopper of decidedJointly
      ? (["a", "b"] as ShopperId[])
      : [winner]) {
      const shortlist = suggestions[shopper];
      const listed = shortlist.some(
        (candidate) => candidate.product.id === product.id,
      );
      suggestions[shopper] = listed
        ? shortlist.map((candidate) =>
            candidate.product.id === product.id ? chosen : candidate,
          )
        : [...shortlist.slice(0, shortlistSize - 1), chosen];
    }

    runningTotal += product.price;
    rounds.push({
      index,
      course,
      throws,
      winner,
      decidedJointly,
      suggestions,
      chosen,
      runningTotal,
    });
  });

  return { rounds, total: runningTotal };
}

function emptyTopByCourse(): Record<
  Course,
  { product: CatalogueProduct; share: number }[]
> {
  const result = {} as Record<
    Course,
    { product: CatalogueProduct; share: number }[]
  >;
  for (const course of MISSION_COURSES) result[course] = [];
  return result;
}

function buildHistogram(totals: number[]): { bucket: string; count: number }[] {
  if (totals.length === 0) return [];

  const { bucketWidth, targetBuckets } = MODEL_CONFIG.histogram;
  const min = Math.floor(Math.min(...totals) / bucketWidth) * bucketWidth;
  const max = Math.ceil(Math.max(...totals) / bucketWidth) * bucketWidth;
  const width = Math.max(
    bucketWidth,
    Math.ceil((max - min) / targetBuckets / bucketWidth) * bucketWidth,
  );

  const buckets: { bucket: string; count: number }[] = [];
  for (let start = min; start < max; start += width) {
    buckets.push({ bucket: `£${start}–${start + width}`, count: 0 });
  }
  if (buckets.length === 0) return [];

  for (const total of totals) {
    const slot = Math.min(Math.floor((total - min) / width), buckets.length - 1);
    buckets[slot].count += 1;
  }
  return buckets;
}

export function runMonteCarlo(
  a: Persona,
  b: Persona,
  opts: MonteCarloOptions,
): SimulationSummary {
  const { seed } = opts;
  const settings = applyInterventions(opts.settings, opts.interventions ?? []);
  const pools = new Map<Course, CatalogueProduct[]>();
  for (const course of settings.courses) {
    const pool = poolFor(course, settings);
    if (pool.length > 0) pools.set(course, pool);
  }
  const courses = [...pools.keys()];

  const totals: number[] = [];
  const counts = new Map<Course, Map<string, number>>();
  const spend = new Map<Course, number>();
  /** Nights the couple reached for the course, before the budget gate. */
  const rolled = new Map<Course, number>();
  /** Nights the course was played and something actually went in the basket. */
  const bought = new Map<Course, number>();
  for (const course of courses) {
    counts.set(course, new Map());
    spend.set(course, 0);
    rolled.set(course, 0);
    bought.set(course, 0);
  }

  let premiumPicks = 0;
  let totalPicks = 0;
  let throwsFingerprint = 0;
  let lopsidedNights = 0;

  for (let night = 0; night < opts.runs; night += 1) {
    // Common random numbers: the streams depend only on (seed, night), so two
    // runs that differ by an intervention replay the same throws and flips and
    // the difference between them is the intervention alone.
    const rng = streamsFor(seed, night);
    let runningTotal = 0;
    // Only rounds that were actually played count towards a lopsided night —
    // a skipped course has no visible winner in the sample either.
    const wins: Record<ShopperId, number> = { a: 0, b: 0 };

    for (const course of courses) {
      const products = pools.get(course);
      if (!products) continue;

      const { throws, winner } = playRound(rng.throws, settings);
      const participationDraw = rng.participation();
      const productDraw = rng.products();

      throwsFingerprint = fingerprintThrows(throwsFingerprint, throws);

      const deciders = decidersFor(a, b, winner, settings);
      const set = considerationSet(
        deciders,
        products,
        runningTotal,
        settings.budget,
        settings,
      );

      if (!rollsCourse(course, participationDraw, settings)) continue;
      rolled.set(course, (rolled.get(course) ?? 0) + 1);

      if (!canAffordCourse(course, set, runningTotal, settings)) continue;

      const product = set.products[sampleIndex(set.probabilities, productDraw)];
      bought.set(course, (bought.get(course) ?? 0) + 1);
      wins[winner] += 1;

      runningTotal += product.price;
      spend.set(course, (spend.get(course) ?? 0) + product.price);

      const courseCounts = counts.get(course);
      if (courseCounts) {
        courseCounts.set(product.id, (courseCounts.get(product.id) ?? 0) + 1);
      }

      if (product.attributes.premium >= MODEL_CONFIG.premiumThreshold) {
        premiumPicks += 1;
      }
      totalPicks += 1;
    }

    if (Math.abs(wins.a - wins.b) >= MODEL_CONFIG.lopsidedWinGap) {
      lopsidedNights += 1;
    }
    totals.push(runningTotal);
  }

  const runs = Math.max(opts.runs, 1);
  const sorted = [...totals].sort((x, y) => x - y);
  const median = sorted.length
    ? sorted.length % 2 === 1
      ? sorted[(sorted.length - 1) / 2]
      : (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
    : 0;

  const topByCourse = emptyTopByCourse();
  for (const course of courses) {
    const products = pools.get(course) ?? [];
    const courseCounts = counts.get(course) ?? new Map<string, number>();
    topByCourse[course] = [...courseCounts.entries()]
      .map(([id, count]) => ({
        product: products.find((product) => product.id === id),
        share: count / runs,
      }))
      .filter(
        (entry): entry is { product: CatalogueProduct; share: number } =>
          entry.product !== undefined,
      )
      .sort((x, y) => y.share - x.share)
      .slice(0, MODEL_CONFIG.topProductsPerCourse);
  }

  const rateFrom = (tally: Map<Course, number>) => {
    const rates = {} as Record<Course, number>;
    for (const course of MISSION_COURSES) {
      rates[course] = (tally.get(course) ?? 0) / runs;
    }
    return rates;
  };

  return {
    runs: opts.runs,
    averageBasket: totals.reduce((sum, value) => sum + value, 0) / runs,
    medianBasket: median,
    histogram: buildHistogram(totals),
    topByCourse,
    categorySpend: courses.map((course) => ({
      course,
      spend: (spend.get(course) ?? 0) / runs,
    })),
    courseParticipation: rateFrom(rolled),
    attachRates: rateFrom(bought),
    premiumShare: totalPicks > 0 ? premiumPicks / totalPicks : 0,
    lopsidedShare: lopsidedNights / runs,
    throwsFingerprint,
  };
}

/**
 * Runs the same nights twice — once as they are, once with one parameter moved —
 * and reports the difference. Both runs share a seed, so they replay identical
 * throws and identical coin flips; whatever separates the two baskets is the
 * intervention and nothing else.
 *
 * The uplift is never written down anywhere. It is only ever the subtraction
 * below, and `intervention.assumption` travels with it so the number is always
 * shown next to the assumption it depends on.
 */
export function compareIntervention(
  a: Persona,
  b: Persona,
  opts: CompareInterventionOptions,
): InterventionComparison {
  const { seed, runs, intervention } = opts;

  // Both sides must play the same courses, so the baseline plays the targeted
  // course too — at its observed rate.
  const settings = withInterventionCourses(opts.settings, [intervention]);

  const baseline = runMonteCarlo(a, b, { seed, runs, settings });
  const withIntervention = runMonteCarlo(a, b, {
    seed,
    runs,
    settings,
    interventions: [intervention],
  });

  const upliftAbs = withIntervention.averageBasket - baseline.averageBasket;

  return {
    intervention,
    baseline,
    withIntervention,
    upliftAbs,
    upliftPct:
      baseline.averageBasket > 0 ? upliftAbs / baseline.averageBasket : 0,
  };
}
