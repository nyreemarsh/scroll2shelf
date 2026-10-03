import evidence from "@/data/evidence.json";
import { catalogue, type Course } from "@/lib/catalogue";
import { MODEL_CONFIG } from "./config";
import { MISSION_ORDER } from "./courses";
import type {
  DecisionStyleId,
  Intervention,
  InterventionId,
  ModelSettings,
} from "./types";

/**
 * The dials a retailer sets before a run, and the evidence behind each one.
 *
 * Every option here either comes straight out of `evidence.json` (the 22-post
 * TikTok sample) or is an explicit assumption. `resolveParameters` turns this
 * into the `ModelSettings` the engine reads; nothing else interprets them.
 */
export interface SimulationParameters {
  shopperA: string;
  shopperB: string;
  /** Total budget for the night across both shoppers, in £. */
  budget: number;
  mood: MoodId;
  coursePreset: string;
  /** 0–1 weight on how much a product's TikTok signal sways the pick. */
  trendExposure: number;
  dealHunting: boolean;
  decisionStyle: DecisionStyleId;
  /** Dietary tag every product must carry, where the catalogue tags it. */
  dietary: string | null;
}

export type MoodId = "cosy" | "impress" | "celebrating" | "low-key";

export interface Mood {
  id: MoodId;
  label: string;
  description: string;
  /** ASSUMPTION — multipliers on the scoring weights in `MODEL_CONFIG`. */
  weightScale: ModelSettings["weightScale"];
  /** ASSUMPTION — multiplier on each shopper's price sensitivity. */
  priceSensitivityScale: number;
}

export const MOODS: Mood[] = [
  {
    id: "cosy",
    label: "Cosy night in",
    description: "Comfort over impressing anyone.",
    weightScale: {
      novelty: 0.8,
      indulgence: 1.35,
      viralPotential: 0.9,
      premium: 0.7,
      dateNight: 1,
      health: 0.8,
    },
    priceSensitivityScale: 1.1,
  },
  {
    id: "impress",
    label: "Impress them",
    description: "Trading up to make an impression.",
    weightScale: {
      novelty: 1.3,
      indulgence: 1,
      viralPotential: 1.2,
      premium: 1.5,
      dateNight: 1.4,
      health: 1,
    },
    priceSensitivityScale: 0.75,
  },
  {
    id: "celebrating",
    label: "Celebrating",
    description: "An occasion worth spending on.",
    weightScale: {
      novelty: 1.1,
      indulgence: 1.3,
      viralPotential: 1.1,
      premium: 1.3,
      dateNight: 1.6,
      health: 0.9,
    },
    priceSensitivityScale: 0.6,
  },
  {
    id: "low-key",
    label: "Low-key",
    description: "A normal weeknight that happens to be shared.",
    weightScale: {
      novelty: 0.85,
      indulgence: 0.9,
      viralPotential: 0.9,
      premium: 0.6,
      dateNight: 0.7,
      health: 1.1,
    },
    priceSensitivityScale: 1.4,
  },
];

export function moodById(id: MoodId): Mood {
  return MOODS.find((mood) => mood.id === id) ?? MOODS[0];
}

export interface CoursePreset {
  id: string;
  label: string;
  courses: Course[];
  /** Posts in the 22-post sample that followed this journey. 0 = not observed. */
  posts: number;
}

const COURSE_BY_NAME = new Map<string, Course>(
  MISSION_ORDER.map((course) => [course, course]),
);

/**
 * Built from the journeys actually observed in the sample, so the options are
 * real shopping patterns rather than every combination of six courses.
 */
export const COURSE_PRESETS: CoursePreset[] = [
  ...evidence.topJourneys
    .map((entry) => {
      const courses = entry.journey
        .split(" > ")
        .map((name) => COURSE_BY_NAME.get(name.trim()))
        .filter((course): course is Course => course !== undefined);

      return {
        id: courses.join("-"),
        label: courses.map(titleCase).join(" · "),
        // Keep the canonical round order rather than the order in the string.
        courses: MISSION_ORDER.filter((course) => courses.includes(course)),
        posts: entry.posts,
      };
    })
    .filter((preset) => preset.courses.length > 0),
  {
    id: MISSION_ORDER.join("-"),
    label: "Every course",
    courses: MISSION_ORDER,
    posts: 0,
  },
];

export function coursePresetById(id: string): CoursePreset {
  return COURSE_PRESETS.find((preset) => preset.id === id) ?? COURSE_PRESETS[0];
}

function titleCase(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export interface DecisionStyle {
  id: DecisionStyleId;
  label: string;
  description: string;
  evidence: string;
}

/** DATA — 42% of the 12 posts we could score were lopsided; 7 rounds were joint. */
export const DECISION_STYLES: DecisionStyle[] = [
  {
    id: "even",
    label: "Even match",
    description: "Every round is a fair throw.",
    evidence: "The baseline — neither shopper is favoured.",
  },
  {
    id: "lopsided",
    label: "One dominates",
    description: "Shopper A wins most of the rounds.",
    evidence: `${Math.round(evidence.lopsidedShare * 100)}% of scored posts were lopsided`,
  },
  {
    id: "joint",
    label: "Decided together",
    description: "Both shoppers' preferences are blended into one pick.",
    evidence: `${evidence.jointDecisions} of ${evidence.decidingRounds} observed rounds were joint`,
  },
];

/** ASSUMPTION — share of rounds the favoured shopper takes in lopsided mode. */
export const LOPSIDED_WIN_RATE = 0.75;

/** ASSUMPTION — how much deal hunting sharpens price sensitivity. */
export const DEAL_HUNTING_SCALE = 1.45;

/** DATA — posts in the sample seen using a multibuy or reduced-to-clear deal. */
export const DEALS_EVIDENCE = {
  posts: evidence.postsUsingDeals,
  totalPosts: evidence.posts,
  examples: evidence.dealsSeen.filter((deal) => !deal.includes("(seen)")),
};

export const BUDGET_RANGE = { min: 20, max: 80, step: 5 } as const;

/**
 * Smallest tagged pool a course needs before a dietary filter is applied to it.
 * Below this the shortlist collapses to a handful of products and the run stops
 * being informative.
 */
const MIN_DIETARY_POOL = 4;

export interface DietaryOption {
  id: string;
  label: string;
  total: number;
  /** Courses where the tagged pool is big enough to filter on. */
  covered: Course[];
  /** Courses left unfiltered because the catalogue barely tags them. */
  uncovered: Course[];
}

/**
 * Dietary coverage is thin and uneven — the catalogue tags almost no desserts
 * or drinks — so the filter only applies where there is a real pool, and the UI
 * says which courses it skipped rather than silently emptying them.
 */
export function dietaryOptions(): DietaryOption[] {
  const tags = new Map<string, number>();
  for (const product of catalogue) {
    for (const tag of product.dietary) {
      tags.set(tag, (tags.get(tag) ?? 0) + 1);
    }
  }

  return [...tags.entries()]
    .map(([id, total]) => {
      const covered: Course[] = [];
      const uncovered: Course[] = [];
      for (const course of MISSION_ORDER) {
        const pool = catalogue.filter(
          (product) => product.course === course && product.dietary.includes(id),
        ).length;
        (pool >= MIN_DIETARY_POOL ? covered : uncovered).push(course);
      }
      return { id, label: titleCase(id.replace("-", " ")), total, covered, uncovered };
    })
    .filter((option) => option.covered.length > 0)
    .sort((a, b) => b.total - a.total);
}

/**
 * What each intervention actually does: the course it targets, and the uptake
 * it is assumed to reach. The rate it starts from is DATA — the share of the 22
 * posts that played that course — and the rate it reaches is an ASSUMPTION held
 * in `MODEL_CONFIG.interventions`. Nothing here states a result.
 */
const INTERVENTION_EFFECTS: Record<
  InterventionId,
  { course: Course; uptake: number; label: string }
> = {
  "wildcard-display": {
    course: "wildcard",
    uptake: MODEL_CONFIG.interventions.wildcardUptake,
    label: "Wildcard round prompt at the till",
  },
  "drink-pairing": {
    course: "drink",
    uptake: MODEL_CONFIG.interventions.drinkUptake,
    label: "Drink pairing suggested with the main",
  },
};

const asPercent = (value: number) => `${Math.round(value * 100)}%`;

/**
 * Built from the effects table, so the sentence shown to a retailer and the
 * number fed to the engine can never disagree.
 */
export const INTERVENTIONS: Intervention[] = (
  Object.keys(INTERVENTION_EFFECTS) as InterventionId[]
).map((id) => {
  const { course, uptake, label } = INTERVENTION_EFFECTS[id];
  const observed = MODEL_CONFIG.courseParticipation[course];
  return {
    id,
    label,
    assumption: `Assumes ${course} uptake rises from ${asPercent(observed)} to ${asPercent(uptake)}`,
  };
});

export function interventionById(id: InterventionId): Intervention {
  return INTERVENTIONS.find((entry) => entry.id === id) ?? INTERVENTIONS[0];
}

/**
 * Applies interventions as the parameter changes they are: each one raises the
 * rate its course is played at, and changes nothing else. The course list is
 * deliberately left alone — see `withInterventionCourses` for why.
 */
export function applyInterventions(
  settings: ModelSettings,
  interventions: Intervention[],
): ModelSettings {
  if (interventions.length === 0) return settings;

  const courseParticipation = { ...settings.courseParticipation };
  for (const { id } of interventions) {
    const effect = INTERVENTION_EFFECTS[id];
    if (effect) courseParticipation[effect.course] = effect.uptake;
  }

  return { ...settings, courseParticipation };
}

/**
 * Puts the courses an intervention acts on into the mission for *both* sides of
 * a comparison. Both runs must play the same courses in the same order, or they
 * consume their random streams differently and stop being comparable; the
 * baseline simply plays the course at its observed rate.
 */
export function withInterventionCourses(
  settings: ModelSettings,
  interventions: Intervention[],
): ModelSettings {
  const courses = new Set(settings.courses);
  for (const { id } of interventions) {
    const effect = INTERVENTION_EFFECTS[id];
    if (effect) courses.add(effect.course);
  }

  return {
    ...settings,
    courses: MISSION_ORDER.filter((course) => courses.has(course)),
  };
}

export const DEFAULT_PARAMETERS: SimulationParameters = {
  shopperA: "trend-led-foodie",
  shopperB: "comfort-food-lover",
  budget: 45,
  mood: "celebrating",
  coursePreset: COURSE_PRESETS[0].id,
  trendExposure: 0.5,
  dealHunting: false,
  decisionStyle: "even",
  dietary: null,
};

/** Turns the retailer's dials into the settings the engine scores against. */
export function resolveParameters(
  parameters: SimulationParameters,
): ModelSettings {
  const mood = moodById(parameters.mood);
  const preset = coursePresetById(parameters.coursePreset);
  const option = parameters.dietary
    ? dietaryOptions().find((entry) => entry.id === parameters.dietary)
    : undefined;

  return {
    courses: preset.courses,
    weightScale: mood.weightScale,
    priceSensitivityScale:
      mood.priceSensitivityScale * (parameters.dealHunting ? DEAL_HUNTING_SCALE : 1),
    trendExposure: parameters.trendExposure,
    budget: parameters.budget,
    decisionStyle: parameters.decisionStyle,
    dietary: option ? { tag: option.id, courses: option.covered } : null,
    courseParticipation: { ...MODEL_CONFIG.courseParticipation },
  };
}
