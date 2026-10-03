import {
  MISSION_COURSES,
  getProduct,
  type CatalogueProduct,
  type Course,
} from "@/lib/catalogue";
import { MODEL_CONFIG } from "./config";
import { additionsFor } from "./meal";
import { hashInts, STREAM, streamFor, type Rng } from "./random";
import {
  considerationSet,
  poolFor,
  reasonsFor,
  sampleIndex,
  topCandidates,
  type WeightedPersona,
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

function streamsFor(seed: number, night: number) {
  return {
    throws: streamFor(seed, night, STREAM.throws),
    participation: streamFor(seed, night, STREAM.participation),
    products: streamFor(seed, night, STREAM.products),
  };
}

function fingerprintThrows(current: number, throws: { a: Move; b: Move }[]) {
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

/** Fair RPS: no persona or retailer control can affect the winning throw. */
function playRound(rng: Rng): Pick<RoundResult, "throws" | "winner"> {
  const throws: { a: Move; b: Move }[] = [];
  for (let attempt = 0; attempt < MODEL_CONFIG.maxThrows; attempt += 1) {
    const a = MOVES[Math.floor(rng() * MOVES.length)];
    const b = MOVES[Math.floor(rng() * MOVES.length)];
    throws.push({ a, b });
    const winner = decideThrow(a, b);
    if (winner) return { throws, winner };
  }
  return { throws, winner: rng() < 0.5 ? "a" : "b" };
}

function settingsFor(opts: MissionOptions): ModelSettings {
  if (!opts.interventions?.some((item) => item.id === "aisle-colocation")) {
    return opts.settings;
  }
  return {
    ...opts.settings,
    aisleExperiment: { ...opts.settings.aisleExperiment, enabled: true },
  };
}

const clamp = (value: number, min = 0, max = 1) =>
  Math.max(min, Math.min(max, value));

function average(a: Persona, b: Persona, key: keyof Persona): number {
  const first = a[key];
  const second = b[key];
  return typeof first === "number" && typeof second === "number"
    ? (first + second) / 2
    : 0;
}

/**
 * Decide what belongs in the shop before RPS decides who chooses the product.
 * The observed journey is a modest prior; visible persona preferences do most
 * of the work so a health-led couple can add a side and leave dessert behind.
 */
export function courseParticipationProbability(
  course: Course,
  a: Persona,
  b: Persona,
  settings: ModelSettings,
): number {
  if (course === "main") return 1;

  const observed = settings.courseParticipation[course] ?? 0;
  const treat = Math.max(a.treatAppetite, b.treatAppetite);
  const health = Math.max(a.healthOrientation, b.healthOrientation);
  const novelty = average(a, b, "noveltySeeking");
  const trend = average(a, b, "trendAffinity");
  const ease = average(a, b, "easePreference");
  const waste = average(a, b, "wasteAvoidance");
  const price = average(a, b, "priceSensitivity");
  const sharing = settings.couple.sharingPreference;
  const wantsVegetables = a.healthGoal === "vegetables" || b.healthGoal === "vegetables";
  const avoidsSugar = a.healthGoal === "less-sugar" || b.healthGoal === "less-sugar";

  switch (course) {
    case "starter":
      return clamp(
        0.08 + 0.35 * observed + 0.2 * treat + 0.08 * novelty +
          0.08 * sharing + 0.05 * ease - 0.08 * waste - 0.04 * price,
        0.2,
        0.9,
      );
    case "side": {
      const propensity =
        0.08 + 0.16 * observed + 0.54 * health +
        (wantsVegetables ? 0.18 : 0) + 0.1 * sharing + 0.06 * ease -
        0.1 * waste - 0.04 * price;
      return clamp(
        health >= 0.85 || wantsVegetables ? Math.max(propensity, 0.82) : propensity,
        0.08,
        0.95,
      );
    }
    case "dessert":
      return clamp(
        0.08 + 0.12 * observed + 0.62 * treat - 0.38 * health -
          (avoidsSugar ? 0.18 : 0) + 0.08 * sharing - 0.08 * waste -
          0.04 * price,
        0.05,
        0.95,
      );
    case "drink":
      return clamp(
        0.12 + 0.35 * observed + 0.16 * treat + 0.08 * trend +
          0.05 * novelty - 0.08 * health - 0.04 * price,
        0.1,
        0.85,
      );
    case "wildcard":
      return clamp(
        0.02 + 0.25 * observed + 0.22 * novelty + 0.17 * treat +
          0.08 * trend - 0.1 * waste - 0.06 * price,
        0.03,
        0.75,
      );
    default:
      return clamp(observed);
  }
}

function courseDecisionReason(
  course: Course,
  selected: boolean,
  a: Persona,
  b: Persona,
): string {
  const health = Math.max(a.healthOrientation, b.healthOrientation);
  const wantsVegetables = a.healthGoal === "vegetables" || b.healthGoal === "vegetables";
  const avoidsSugar = a.healthGoal === "less-sugar" || b.healthGoal === "less-sugar";

  if (course === "main") return "The main is the anchor of this date-night shop.";
  if (course === "side") {
    if (selected && (health >= 0.75 || wantsVegetables)) {
      return "Their health goals made a supporting side likely.";
    }
    return selected
      ? "A more complete shared meal made a side worth adding."
      : "A separate side did not add enough value for this couple.";
  }
  if (course === "dessert") {
    if (!selected && (health >= 0.7 || avoidsSugar)) {
      return "Their health priorities outweighed their appetite for dessert."
    }
    return selected
      ? "Their treat appetite made dessert worth adding."
      : "They chose not to add a sweet course this time.";
  }
  if (course === "starter") {
    return selected
      ? "A shared opener fitted the occasion."
      : "They kept the meal focused and skipped a starter.";
  }
  if (course === "drink") {
    return selected
      ? "A drink fitted the occasion and their preferences."
      : "A separate drink was not important to this shop.";
  }
  return selected
    ? "Their curiosity left room for one extra pick."
    : "They stayed with the planned meal instead of adding an extra.";
}

export function winnerInfluence(settings: ModelSettings): number {
  return (
    0.5 +
    0.5 * settings.couple.winnerControl * (1 - settings.couple.compromise)
  );
}

function decisionWeights(
  a: Persona,
  b: Persona,
  winner: ShopperId,
  settings: ModelSettings,
): WeightedPersona[] {
  const winnerShare = winnerInfluence(settings);
  return winner === "a"
    ? [
        { persona: a, share: winnerShare },
        { persona: b, share: 1 - winnerShare },
      ]
    : [
        { persona: a, share: 1 - winnerShare },
        { persona: b, share: winnerShare },
      ];
}

const individual = (persona: Persona): WeightedPersona[] => [
  { persona, share: 1 },
];

function candidateFor(
  product: CatalogueProduct,
  probability: number,
  people: WeightedPersona[],
  basket: CatalogueProduct[],
  runningTotal: number,
  settings: ModelSettings,
): Candidate {
  return {
    product,
    probability,
    reasons: reasonsFor(people, product, { basket, runningTotal }, settings),
  };
}

export function simulateMission(
  a: Persona,
  b: Persona,
  opts: MissionOptions,
): MissionResult {
  const settings = settingsFor(opts);
  const rng = streamsFor(opts.seed, 0);
  const rounds: RoundResult[] = [];
  const courseDecisions: MissionResult["courseDecisions"] = [];
  const unavailableCourses: Course[] = [];
  const basket: CatalogueProduct[] = [];
  let runningTotal = 0;

  settings.courses.forEach((course, index) => {
    const probability = courseParticipationProbability(course, a, b, settings);
    const selected = rng.participation() < probability;
    courseDecisions.push({
      course,
      selected,
      probability,
      reason: courseDecisionReason(course, selected, a, b),
    });
    if (!selected) return;

    const products = poolFor(course, settings);
    if (products.length === 0) {
      unavailableCourses.push(course);
      return;
    }

    const { throws, winner } = playRound(rng.throws);
    const productDraw = rng.products();

    const context = { basket, runningTotal };
    const people = decisionWeights(a, b, winner, settings);
    const decidingSet = considerationSet(people, products, context, settings);
    const setA = considerationSet(individual(a), products, context, settings);
    const setB = considerationSet(individual(b), products, context, settings);

    const pickedIndex = sampleIndex(decidingSet.probabilities, productDraw);
    const product = decidingSet.products[pickedIndex];
    const chosen = candidateFor(
      product,
      decidingSet.probabilities[pickedIndex],
      people,
      basket,
      runningTotal,
      settings,
    );
    const alternativeIndex = decidingSet.products.findIndex(
      (item) => item.id !== product.id,
    );
    const closeAlternative =
      alternativeIndex >= 0
        ? candidateFor(
            decidingSet.products[alternativeIndex],
            decidingSet.probabilities[alternativeIndex],
            people,
            basket,
            runningTotal,
            settings,
          )
        : null;

    const suggestions = {
      a: topCandidates(individual(a), setA, context, settings, MODEL_CONFIG.suggestionsPerShopper),
      b: topCandidates(individual(b), setB, context, settings, MODEL_CONFIG.suggestionsPerShopper),
    };
    const winnerList = suggestions[winner];
    if (!winnerList.some((entry) => entry.product.id === product.id)) {
      suggestions[winner] = [...winnerList.slice(0, -1), chosen];
    }

    const additions = additionsFor(course, product);
    const picked = [product, ...additions.map((item) => item.product)];
    basket.push(...picked);
    runningTotal += picked.reduce((sum, item) => sum + item.price, 0);
    const influence = winnerInfluence(settings);
    rounds.push({
      index,
      course,
      throws,
      winner,
      decidedJointly: influence <= 0.55,
      winnerInfluence: influence,
      suggestions,
      chosen,
      additions,
      closeAlternative,
      runningTotal,
    });
  });

  return { rounds, courseDecisions, total: runningTotal, unavailableCourses };
}

function emptyTopByCourse(): SimulationSummary["topByCourse"] {
  const result = {} as SimulationSummary["topByCourse"];
  for (const course of MISSION_COURSES) result[course] = [];
  return result;
}

function buildHistogram(totals: number[]) {
  if (totals.length === 0) return [];
  const { bucketWidth, targetBuckets } = MODEL_CONFIG.histogram;
  const min = Math.floor(Math.min(...totals) / bucketWidth) * bucketWidth;
  const maxRaw = Math.ceil(Math.max(...totals) / bucketWidth) * bucketWidth;
  const max = Math.max(maxRaw, min + bucketWidth);
  const width = Math.max(
    bucketWidth,
    Math.ceil((max - min) / targetBuckets / bucketWidth) * bucketWidth,
  );
  const buckets: { bucket: string; count: number }[] = [];
  for (let start = min; start < max; start += width) {
    buckets.push({ bucket: `£${start}–${start + width}`, count: 0 });
  }
  for (const total of totals) {
    const slot = Math.min(Math.floor((total - min) / width), buckets.length - 1);
    buckets[slot].count += 1;
  }
  return buckets;
}

function increment(map: Map<string, number>, key: string) {
  map.set(key, (map.get(key) ?? 0) + 1);
}

export function runMonteCarlo(
  a: Persona,
  b: Persona,
  opts: MonteCarloOptions,
): SimulationSummary {
  const settings = settingsFor(opts);
  const pools = new Map<Course, CatalogueProduct[]>();
  for (const course of settings.courses) {
    const pool = poolFor(course, settings);
    if (pool.length > 0) pools.set(course, pool);
  }
  const courses = [...pools.keys()];
  const totals: number[] = [];
  const productCounts = new Map<Course, Map<string, number>>();
  const spend = new Map<Course, number>();
  const rolled = new Map<Course, number>();
  const bought = new Map<Course, number>();
  const pairCounts = new Map<string, number>();
  const basketCounts = new Map<string, number>();
  for (const course of courses) {
    productCounts.set(course, new Map());
    spend.set(course, 0);
    rolled.set(course, 0);
    bought.set(course, 0);
  }

  let premiumPicks = 0;
  let totalPicks = 0;
  let throwsFingerprint = 0;
  let lopsidedNights = 0;
  let overBudgetNights = 0;
  let totalOverspend = 0;

  for (let night = 0; night < opts.runs; night += 1) {
    const rng = streamsFor(opts.seed, night);
    const basket: CatalogueProduct[] = [];
    let runningTotal = 0;
    const wins: Record<ShopperId, number> = { a: 0, b: 0 };

    for (const course of courses) {
      const products = pools.get(course);
      if (!products) continue;
      const participationDraw = rng.participation();
      const probability = courseParticipationProbability(course, a, b, settings);
      if (participationDraw >= probability) continue;

      const { throws, winner } = playRound(rng.throws);
      const productDraw = rng.products();
      throwsFingerprint = fingerprintThrows(throwsFingerprint, throws);
      rolled.set(course, (rolled.get(course) ?? 0) + 1);

      const people = decisionWeights(a, b, winner, settings);
      const set = considerationSet(
        people,
        products,
        { basket, runningTotal },
        settings,
      );
      const product = set.products[sampleIndex(set.probabilities, productDraw)];
      if (!product) continue;

      wins[winner] += 1;
      bought.set(course, (bought.get(course) ?? 0) + 1);
      const additions = additionsFor(course, product);
      const picked = [product, ...additions.map((item) => item.product)];
      const courseSpend = picked.reduce((sum, item) => sum + item.price, 0);
      runningTotal += courseSpend;
      spend.set(course, (spend.get(course) ?? 0) + courseSpend);
      basket.push(...picked);
      const counts = productCounts.get(course);
      if (counts) counts.set(product.id, (counts.get(product.id) ?? 0) + 1);
      for (const item of picked) {
        if (item.attributes.premium >= MODEL_CONFIG.premiumThreshold) premiumPicks += 1;
        totalPicks += 1;
      }
    }

    if (Math.abs(wins.a - wins.b) >= MODEL_CONFIG.lopsidedWinGap) lopsidedNights += 1;
    const overspend = Math.max(0, runningTotal - settings.budget);
    if (overspend > 0) {
      overBudgetNights += 1;
      totalOverspend += overspend;
    }
    totals.push(runningTotal);

    for (let i = 0; i < basket.length; i += 1) {
      for (let j = i + 1; j < basket.length; j += 1) {
        increment(pairCounts, [basket[i].id, basket[j].id].sort().join("|"));
      }
    }
    increment(basketCounts, basket.map((product) => product.id).join("|"));
  }

  const runs = Math.max(opts.runs, 1);
  const sorted = [...totals].sort((x, y) => x - y);
  const median = sorted.length % 2
    ? sorted[(sorted.length - 1) / 2]
    : ((sorted[sorted.length / 2 - 1] ?? 0) + (sorted[sorted.length / 2] ?? 0)) / 2;
  const topByCourse = emptyTopByCourse();
  for (const course of courses) {
    const counts = productCounts.get(course) ?? new Map();
    topByCourse[course] = [...counts.entries()]
      .map(([id, count]) => ({ product: getProduct(id), share: count / runs }))
      .filter((entry): entry is { product: CatalogueProduct; share: number } => Boolean(entry.product))
      .sort((x, y) => y.share - x.share)
      .slice(0, MODEL_CONFIG.topProductsPerCourse);
  }

  const rateFrom = (tally: Map<Course, number>) =>
    Object.fromEntries(
      MISSION_COURSES.map((course) => [course, (tally.get(course) ?? 0) / runs]),
    ) as Record<Course, number>;

  const commonPairings = [...pairCounts.entries()]
    .sort((aEntry, bEntry) => bEntry[1] - aEntry[1])
    .slice(0, 6)
    .map(([key, count]) => {
      const [aId, bId] = key.split("|");
      const first = getProduct(aId);
      const second = getProduct(bId);
      return first && second ? { products: [first, second] as [CatalogueProduct, CatalogueProduct], share: count / runs } : null;
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null);

  const commonBaskets = [...basketCounts.entries()]
    .sort((aEntry, bEntry) => bEntry[1] - aEntry[1])
    .slice(0, 5)
    .map(([key, count]) => ({
      products: key.split("|").map(getProduct).filter((product): product is CatalogueProduct => Boolean(product)),
      share: count / runs,
    }));

  return {
    runs: opts.runs,
    averageBasket: totals.reduce((sum, value) => sum + value, 0) / runs,
    medianBasket: median,
    minBasket: sorted[0] ?? 0,
    maxBasket: sorted[sorted.length - 1] ?? 0,
    overBudgetRate: overBudgetNights / runs,
    averageOverspend: overBudgetNights ? totalOverspend / overBudgetNights : 0,
    histogram: buildHistogram(totals),
    topByCourse,
    categorySpend: courses.map((course) => ({
      course,
      spend: (spend.get(course) ?? 0) / runs,
    })),
    commonPairings,
    commonBaskets,
    courseParticipation: rateFrom(rolled),
    attachRates: rateFrom(bought),
    premiumShare: totalPicks ? premiumPicks / totalPicks : 0,
    lopsidedShare: lopsidedNights / runs,
    throwsFingerprint,
  };
}

export function compareIntervention(
  a: Persona,
  b: Persona,
  opts: CompareInterventionOptions,
): InterventionComparison {
  const baselineSettings: ModelSettings = {
    ...opts.settings,
    aisleExperiment: { ...opts.settings.aisleExperiment, enabled: false },
  };
  const proposalSettings: ModelSettings = {
    ...opts.settings,
    aisleExperiment: { ...opts.settings.aisleExperiment, enabled: true },
  };
  const baseline = runMonteCarlo(a, b, {
    seed: opts.seed,
    runs: opts.runs,
    settings: baselineSettings,
  });
  const withIntervention = runMonteCarlo(a, b, {
    seed: opts.seed,
    runs: opts.runs,
    settings: proposalSettings,
  });
  const upliftAbs = withIntervention.averageBasket - baseline.averageBasket;
  return {
    intervention: opts.intervention,
    baseline,
    withIntervention,
    upliftAbs,
    upliftPct: baseline.averageBasket ? upliftAbs / baseline.averageBasket : 0,
  };
}
