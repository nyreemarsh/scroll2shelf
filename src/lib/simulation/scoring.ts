import {
  productsForCourse,
  type CatalogueProduct,
  type Course,
} from "@/lib/catalogue";
import { MODEL_CONFIG } from "./config";
import { isCompleteCourseProduct } from "./meal";
import type {
  Candidate,
  ModelSettings,
  Persona,
} from "./types";

export interface WeightedPersona {
  persona: Persona;
  share: number;
}

interface ScoringContext {
  runningTotal: number;
  basket: CatalogueProduct[];
}

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));
const importance = (value: number) => 0.2 + 1.8 * value;

function goalFit(persona: Persona, product: CatalogueProduct): number {
  switch (persona.healthGoal) {
    case "protein":
      return product.attributes.proteinFit;
    case "vegetables":
      return product.attributes.vegetableFit;
    case "less-sugar":
      return product.attributes.lowSugarFit;
    default:
      return product.attributes.healthy;
  }
}

function personaTerms(persona: Persona, product: CatalogueProduct) {
  const { attributes } = product;
  const treatTarget = attributes.indulgent * 0.72 + attributes.premium * 0.28;
  const trendSignal = product.trendSignal * 0.7 + attributes.viralPotential * 0.3;

  return [
    {
      label: "Treat appetite",
      value: 1 - Math.abs(persona.treatAppetite - treatTarget),
    },
    {
      label: "Flavour match",
      value: 1 - Math.abs(persona.flavourBoldness - attributes.flavourIntensity),
    },
    {
      label: persona.noveltySeeking >= 0.5 ? "Discovery fit" : "Familiar favourite",
      value:
        persona.noveltySeeking * attributes.adventurous +
        (1 - persona.noveltySeeking) * attributes.familiar,
    },
    {
      label: "TikTok influence",
      value: importance(persona.trendAffinity) * trendSignal,
    },
    {
      label: "Health-goal fit",
      value: importance(persona.healthOrientation) * goalFit(persona, product),
    },
    {
      label: "Easy preparation",
      value: importance(persona.easePreference) * attributes.convenience,
    },
    {
      label: "Sustainability fit",
      value:
        importance(persona.sustainabilityPriority) * attributes.sustainability,
    },
    {
      label: "Lower-waste fit",
      value: importance(persona.wasteAvoidance) * attributes.lowWaste,
    },
  ];
}

function aisleBonus(
  product: CatalogueProduct,
  basket: CatalogueProduct[],
  settings: ModelSettings,
): number {
  const experiment = settings.aisleExperiment;
  if (!experiment.enabled || basket.length === 0) return 0;
  const hasA = basket.some((item) => item.aisle === experiment.aisleA);
  const hasB = basket.some((item) => item.aisle === experiment.aisleB);
  if (
    (hasA && product.aisle === experiment.aisleB) ||
    (hasB && product.aisle === experiment.aisleA)
  ) {
    return experiment.effect;
  }
  return 0;
}

function weightedTerms(
  people: WeightedPersona[],
  product: CatalogueProduct,
): { label: string; weight: number }[] {
  const totals = new Map<string, number>();
  for (const { persona, share } of people) {
    for (const term of personaTerms(persona, product)) {
      totals.set(term.label, (totals.get(term.label) ?? 0) + term.value * share);
    }
  }
  return [...totals.entries()].map(([label, weight]) => ({ label, weight }));
}

function utilityFor(
  people: WeightedPersona[],
  product: CatalogueProduct,
  context: ScoringContext,
  settings: ModelSettings,
): number {
  const terms = weightedTerms(people, product);
  const preference =
    terms.reduce((sum, term) => sum + term.weight, 0) / Math.max(terms.length, 1);

  const sensitivity = people.reduce(
    (sum, person) => sum + person.persona.priceSensitivity * person.share,
    0,
  );
  const allowance = settings.budget / Math.max(settings.courses.length, 1);
  const pricePressure = sensitivity * (product.price / Math.max(allowance, 1)) * 0.22;
  const projectedOverspend = Math.max(
    0,
    context.runningTotal + product.price - settings.budget,
  );
  const overspendPenalty =
    (projectedOverspend / Math.max(settings.budget, 1)) *
    sensitivity *
    (1 - settings.couple.budgetFlexibility) *
    1.4;

  return (
    preference -
    pricePressure -
    overspendPenalty +
    product.attributes.romantic * 0.06 +
    product.attributes.shareable * settings.couple.sharingPreference * 0.1 +
    aisleBonus(product, context.basket, settings)
  );
}

function softmax(scores: number[]): number[] {
  const max = Math.max(...scores);
  const exponentials = scores.map((value) =>
    Math.exp((value - max) / MODEL_CONFIG.temperature),
  );
  const sum = exponentials.reduce((total, value) => total + value, 0);
  return exponentials.map((value) => value / sum);
}

export interface ConsiderationSet {
  products: CatalogueProduct[];
  probabilities: number[];
}

export function poolFor(
  course: Course,
  settings: ModelSettings,
): CatalogueProduct[] {
  void settings;
  return productsForCourse(course).filter((product) => isCompleteCourseProduct(product, course));
}

export function considerationSet(
  people: WeightedPersona[],
  products: CatalogueProduct[],
  context: ScoringContext,
  settings: ModelSettings,
): ConsiderationSet {
  const ranked = products
    .map((product) => ({
      product,
      value: utilityFor(people, product, context, settings),
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, MODEL_CONFIG.considerationSet);

  return {
    products: ranked.map((entry) => entry.product),
    probabilities: softmax(ranked.map((entry) => entry.value)),
  };
}

export function reasonsFor(
  people: WeightedPersona[],
  product: CatalogueProduct,
  context: ScoringContext,
  settings: ModelSettings,
): Candidate["reasons"] {
  const allowance = settings.budget / Math.max(settings.courses.length, 1);
  const priceSensitivity = people.reduce(
    (sum, person) => sum + person.persona.priceSensitivity * person.share,
    0,
  );
  const reasons = weightedTerms(people, product);
  reasons.push({
    label: "Price fit",
    weight:
      priceSensitivity * clamp01(1 - product.price / Math.max(allowance * 1.5, 1)),
  });
  const coLocation = aisleBonus(product, context.basket, settings);
  if (coLocation > 0) {
    reasons.push({ label: "Displayed with a basket aisle", weight: coLocation });
  }
  return reasons
    .filter((reason) => reason.weight > MODEL_CONFIG.reasonFloor)
    .sort((a, b) => b.weight - a.weight)
    .slice(0, MODEL_CONFIG.reasonsShown);
}

export function topCandidates(
  people: WeightedPersona[],
  set: ConsiderationSet,
  context: ScoringContext,
  settings: ModelSettings,
  limit: number,
): Candidate[] {
  return set.products.slice(0, limit).map((product, index) => ({
    product,
    probability: set.probabilities[index],
    reasons: reasonsFor(people, product, context, settings),
  }));
}

export function sampleIndex(probabilities: number[], draw: number): number {
  let cursor = draw;
  for (let index = 0; index < probabilities.length; index += 1) {
    cursor -= probabilities[index];
    if (cursor <= 0) return index;
  }
  return Math.max(0, probabilities.length - 1);
}
