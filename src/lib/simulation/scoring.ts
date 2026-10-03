import {
  productsForCourse,
  type CatalogueProduct,
  type Course,
} from "@/lib/catalogue";
import { MODEL_CONFIG } from "./config";
import type { Candidate, ModelSettings, Persona } from "./types";

const { budgetPenalty } = MODEL_CONFIG;

type WeightKey = keyof typeof MODEL_CONFIG.weights;

interface Term {
  /** The weight in `MODEL_CONFIG.weights` this term is counted at. */
  key: WeightKey;
  label: string;
  /** The persona-times-product match, before any weighting. */
  raw: (persona: Persona, product: CatalogueProduct) => number;
  /** The retailer dial that scales this term for the run. */
  scale: (settings: ModelSettings) => number;
}

/**
 * Positive scoring terms. `baseScore` and `reasonsFor` both read this table, so
 * the explanation shown in the UI can never drift from the score that was used,
 * and a new term appears in the "why" reasons as soon as it is added here.
 */
const TERMS: Term[] = [
  {
    key: "novelty",
    label: "Novelty match",
    raw: (p, product) => p.noveltySeeking * product.attributes.adventurous,
    scale: (s) => s.weightScale.novelty,
  },
  {
    key: "indulgence",
    label: "Indulgence match",
    raw: (p, product) => p.indulgence * product.attributes.indulgent,
    scale: (s) => s.weightScale.indulgence,
  },
  {
    // The measured signal: how often couples were filmed buying this product.
    // Scaled by the retailer's trend-exposure dial rather than by a mood.
    key: "tiktok",
    label: "Seen on TikTok",
    raw: (p, product) => p.trendAffinity * product.trendSignal,
    scale: (s) => s.trendExposure,
  },
  {
    key: "viralPotential",
    label: "Trend affinity",
    raw: (p, product) => p.trendAffinity * product.attributes.viralPotential,
    scale: (s) => s.weightScale.viralPotential,
  },
  {
    key: "premium",
    label: "Premium preference",
    raw: (p, product) => p.premiumPreference * product.attributes.premium,
    scale: (s) => s.weightScale.premium,
  },
  {
    key: "dateNight",
    label: "Date-night context",
    raw: (_p, product) => product.attributes.romantic,
    scale: (s) => s.weightScale.dateNight,
  },
  {
    key: "health",
    label: "Health orientation",
    raw: (p, product) => p.healthOrientation * product.attributes.healthy,
    scale: (s) => s.weightScale.health,
  },
];

function termValue(term: Term, raw: number, settings: ModelSettings): number {
  return MODEL_CONFIG.weights[term.key] * term.scale(settings) * raw;
}

function baseScore(
  persona: Persona,
  product: CatalogueProduct,
  settings: ModelSettings,
): number {
  let total = 0;
  for (const term of TERMS) {
    total += termValue(term, term.raw(persona, product), settings);
  }
  return total;
}

/**
 * Top contributors to the score, averaged across everyone who had a say — one
 * persona normally, both when the round was decided jointly.
 */
export function reasonsFor(
  personas: Persona[],
  product: CatalogueProduct,
  settings: ModelSettings,
): Candidate["reasons"] {
  return TERMS.map((term) => {
    const mean =
      personas.reduce((sum, persona) => sum + term.raw(persona, product), 0) /
      personas.length;
    return { label: term.label, weight: termValue(term, mean, settings) };
  })
    .filter((reason) => reason.weight > MODEL_CONFIG.reasonFloor)
    .sort((a, b) => b.weight - a.weight)
    .slice(0, MODEL_CONFIG.reasonsShown);
}

/**
 * The shelf a course is picked from. A dietary filter only applies to courses
 * the catalogue tags well enough to leave a usable pool.
 */
export function poolFor(
  course: Course,
  settings: ModelSettings,
): CatalogueProduct[] {
  const products = productsForCourse(course);
  const { dietary } = settings;
  if (!dietary || !dietary.courses.includes(course)) return products;

  const filtered = products.filter((product) =>
    product.dietary.includes(dietary.tag),
  );
  return filtered.length > 0 ? filtered : products;
}

/**
 * What the couple can spend on one course if they spread the night's budget
 * evenly. Pricing against this rather than against the most expensive thing on
 * the shelf is what makes the budget dial actually steer the basket: the same
 * £12 main reads as extravagant on £25 and unremarkable on £80.
 */
function allowanceFor(settings: ModelSettings): number {
  return settings.budget / Math.max(settings.courses.length, 1);
}

function scoreFor(
  personas: Persona[],
  product: CatalogueProduct,
  allowance: number,
  runningTotal: number,
  budget: number,
  settings: ModelSettings,
): number {
  const base =
    personas.reduce(
      (sum, persona) => sum + baseScore(persona, product, settings),
      0,
    ) / personas.length;

  const sensitivity =
    (personas.reduce((sum, persona) => sum + persona.priceSensitivity, 0) /
      personas.length) *
    settings.priceSensitivityScale;

  const pricePenalty = sensitivity * (product.price / allowance);
  const overBudget = Math.max(0, runningTotal + product.price - budget) / budget;
  const penalty =
    budgetPenalty.weight * overBudget * (budgetPenalty.floor + sensitivity);

  return base - pricePenalty - penalty;
}

function softmax(scores: number[]): number[] {
  let max = -Infinity;
  for (const value of scores) if (value > max) max = value;

  const exponentials = scores.map((value) =>
    Math.exp((value - max) / MODEL_CONFIG.temperature),
  );
  const sum = exponentials.reduce((total, weight) => total + weight, 0);
  return exponentials.map((weight) => weight / sum);
}

export interface ConsiderationSet {
  products: CatalogueProduct[];
  probabilities: number[];
}

/** The shortlist a course is actually decided from, best-scoring first. */
export function considerationSet(
  personas: Persona[],
  products: CatalogueProduct[],
  runningTotal: number,
  budget: number,
  settings: ModelSettings,
): ConsiderationSet {
  const allowance = allowanceFor(settings);
  const ranked = products
    .map((product) => ({
      product,
      value: scoreFor(
        personas,
        product,
        allowance,
        runningTotal,
        budget,
        settings,
      ),
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, MODEL_CONFIG.considerationSet);

  return {
    products: ranked.map((entry) => entry.product),
    probabilities: softmax(ranked.map((entry) => entry.value)),
  };
}

export function topCandidates(
  personas: Persona[],
  set: ConsiderationSet,
  settings: ModelSettings,
  limit: number,
): Candidate[] {
  return set.products
    .map((product, index) => ({
      product,
      probability: set.probabilities[index],
      reasons: reasonsFor(personas, product, settings),
    }))
    .sort((a, b) => b.probability - a.probability)
    .slice(0, limit);
}

/**
 * Inverse-transform sampling from an already-drawn uniform. The draw is taken
 * by the caller so it can happen on every course, played or not, which keeps
 * the random stream aligned when participation changes between runs.
 */
export function sampleIndex(probabilities: number[], draw: number): number {
  let cursor = draw;
  for (let i = 0; i < probabilities.length; i += 1) {
    cursor -= probabilities[i];
    if (cursor <= 0) return i;
  }
  return probabilities.length - 1;
}

export function cheapestPrice(products: CatalogueProduct[]): number {
  let cheapest = Infinity;
  for (const product of products) {
    if (product.price < cheapest) cheapest = product.price;
  }
  return cheapest;
}
