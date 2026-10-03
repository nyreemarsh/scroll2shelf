import type { Persona, ShopperPreferences } from "@/lib/simulation/types";

const seed = (persona: Persona): Persona => persona;

/** Scenario presets whose food-choice controls remain visible and editable. */
export const personas: Persona[] = [
  seed({
    id: "familiar-favourite", name: "The Familiar Favourite",
    tagline: "Needs a clear reason to trade a trusted favourite for something new.", budget: 36,
    priceSensitivity: .55, treatAppetite: .52, flavourBoldness: .28,
    noveltySeeking: .18, trendAffinity: .2, healthOrientation: .45,
    healthGoal: "balanced", easePreference: .58, sustainabilityPriority: .4, wasteAvoidance: .55,
  }),
  seed({
    id: "deal-detective", name: "The Deal Detective",
    tagline: "Compares price, portion and value before changing brands for a real saving.", budget: 30,
    priceSensitivity: .95, treatAppetite: .38, flavourBoldness: .48,
    noveltySeeking: .42, trendAffinity: .3, healthOrientation: .42,
    healthGoal: "balanced", easePreference: .5, sustainabilityPriority: .28, wasteAvoidance: .72,
  }),
  seed({
    id: "curious-taster", name: "The Curious Taster",
    tagline: "Looks for new flavours and unusual combinations, even when they risk clashing.", budget: 42,
    priceSensitivity: .32, treatAppetite: .62, flavourBoldness: .92,
    noveltySeeking: .96, trendAffinity: .7, healthOrientation: .35,
    healthGoal: "balanced", easePreference: .35, sustainabilityPriority: .44, wasteAvoidance: .3,
  }),
  seed({
    id: "tired-shortcut-seeker", name: "The Tired Shortcut-Seeker",
    tagline: "Wants a good result with very little preparation or searching.", budget: 35,
    priceSensitivity: .5, treatAppetite: .62, flavourBoldness: .45,
    noveltySeeking: .28, trendAffinity: .3, healthOrientation: .35,
    healthGoal: "balanced", easePreference: .98, sustainabilityPriority: .32, wasteAvoidance: .42,
  }),
  seed({
    id: "health-balancer", name: "The Health Balancer",
    tagline: "Pursues a health goal without allowing dinner to feel like a chore.", budget: 38,
    priceSensitivity: .52, treatAppetite: .38, flavourBoldness: .58,
    noveltySeeking: .48, trendAffinity: .38, healthOrientation: .98,
    healthGoal: "protein", easePreference: .58, sustainabilityPriority: .62, wasteAvoidance: .62,
  }),
  seed({
    id: "treat-seeker", name: "The Treat-Seeker",
    tagline: "Keeps room in the basket for the one item that makes the night special.", budget: 52,
    priceSensitivity: .16, treatAppetite: .98, flavourBoldness: .68,
    noveltySeeking: .58, trendAffinity: .58, healthOrientation: .2,
    healthGoal: "balanced", easePreference: .5, sustainabilityPriority: .3, wasteAvoidance: .28,
  }),
  seed({
    id: "careful-label-reader", name: "The Careful Label Reader",
    tagline: "Checks ingredients and claims closely before letting a product into the basket.", budget: 38,
    priceSensitivity: .52, treatAppetite: .45, flavourBoldness: .5,
    noveltySeeking: .35, trendAffinity: .22, healthOrientation: .78,
    healthGoal: "less-sugar", easePreference: .4, sustainabilityPriority: .72, wasteAvoidance: .72,
  }),
  seed({
    id: "waste-conscious-planner", name: "The Waste-Conscious Planner",
    tagline: "Pictures leftovers and pack use before judging whether a product is good value.", budget: 35,
    priceSensitivity: .68, treatAppetite: .35, flavourBoldness: .5,
    noveltySeeking: .38, trendAffinity: .2, healthOrientation: .58,
    healthGoal: "vegetables", easePreference: .48, sustainabilityPriority: .9, wasteAvoidance: .98,
  }),
  seed({
    id: "generous-host", name: "The Generous Host",
    tagline: "Prioritises enough food, broad appeal and something inviting to share.", budget: 55,
    priceSensitivity: .28, treatAppetite: .7, flavourBoldness: .55,
    noveltySeeking: .45, trendAffinity: .4, healthOrientation: .42,
    healthGoal: "balanced", easePreference: .6, sustainabilityPriority: .42, wasteAvoidance: .38,
  }),
  seed({
    id: "trend-recreator", name: "The Trend Recreator",
    tagline: "Wants the social format and reveal to feel recognisable, even if brands change.", budget: 44,
    priceSensitivity: .34, treatAppetite: .68, flavourBoldness: .68,
    noveltySeeking: .78, trendAffinity: .98, healthOrientation: .3,
    healthGoal: "balanced", easePreference: .48, sustainabilityPriority: .35, wasteAvoidance: .28,
  }),
  seed({
    id: "taste-first-shopper", name: "The Taste-First Shopper",
    tagline: "Imagines the first bite and values flavour over lengthy claims.", budget: 45,
    priceSensitivity: .25, treatAppetite: .78, flavourBoldness: .88,
    noveltySeeking: .58, trendAffinity: .42, healthOrientation: .18,
    healthGoal: "balanced", easePreference: .42, sustainabilityPriority: .25, wasteAvoidance: .28,
  }),
  seed({
    id: "impulse-adder", name: "The Impulse Adder",
    tagline: "Keeps noticing extras that would make the evening a little better.", budget: 42,
    priceSensitivity: .28, treatAppetite: .88, flavourBoldness: .62,
    noveltySeeking: .72, trendAffinity: .7, healthOrientation: .25,
    healthGoal: "balanced", easePreference: .6, sustainabilityPriority: .28, wasteAvoidance: .12,
  }),
  seed({
    id: "quiet-compromiser", name: "The Quiet Compromiser",
    tagline: "Has real preferences but often accepts a good-enough shared choice.", budget: 38,
    priceSensitivity: .5, treatAppetite: .5, flavourBoldness: .48,
    noveltySeeking: .42, trendAffinity: .35, healthOrientation: .5,
    healthGoal: "balanced", easePreference: .55, sustainabilityPriority: .52, wasteAvoidance: .62,
  }),
  seed({
    id: "plan-keeper", name: "The Plan Keeper",
    tagline: "Keeps courses, budget and the coherence of the whole meal in view.", budget: 40,
    priceSensitivity: .7, treatAppetite: .42, flavourBoldness: .48,
    noveltySeeking: .32, trendAffinity: .25, healthOrientation: .58,
    healthGoal: "balanced", easePreference: .62, sustainabilityPriority: .55, wasteAvoidance: .82,
  }),
  seed({
    id: "comfort-food-shopper", name: "The Comfort-Food Shopper",
    tagline: "Seeks familiar, soothing food and has little patience for a complicated choice.", budget: 37,
    priceSensitivity: .5, treatAppetite: .86, flavourBoldness: .34,
    noveltySeeking: .16, trendAffinity: .24, healthOrientation: .22,
    healthGoal: "balanced", easePreference: .82, sustainabilityPriority: .32, wasteAvoidance: .45,
  }),
];

export const SUPPORTED_COUPLES: [string, string][] = [
  ["plan-keeper", "curious-taster"],
  ["deal-detective", "treat-seeker"],
  ["health-balancer", "taste-first-shopper"],
  ["tired-shortcut-seeker", "careful-label-reader"],
  ["waste-conscious-planner", "generous-host"],
  ["trend-recreator", "familiar-favourite"],
  ["impulse-adder", "deal-detective"],
  ["quiet-compromiser", "taste-first-shopper"],
  ["curious-taster", "curious-taster"],
  ["plan-keeper", "plan-keeper"],
  ["treat-seeker", "tired-shortcut-seeker"],
  ["health-balancer", "comfort-food-shopper"],
];

export const DEFAULT_SHOPPER_A = "trend-recreator";
export const DEFAULT_SHOPPER_B = "familiar-favourite";

export function personaById(id: string): Persona {
  return personas.find((persona) => persona.id === id) ?? personas[0];
}

export function compatiblePartnerIds(id: string): string[] {
  const compatible = new Set<string>();
  for (const [a, b] of SUPPORTED_COUPLES) {
    if (a === id) compatible.add(b);
    if (b === id) compatible.add(a);
  }
  return [...compatible];
}

export function preferencesFor(id: string): ShopperPreferences {
  const persona = personaById(id);
  return {
    priceSensitivity: persona.priceSensitivity,
    treatAppetite: persona.treatAppetite,
    flavourBoldness: persona.flavourBoldness,
    noveltySeeking: persona.noveltySeeking,
    trendAffinity: persona.trendAffinity,
    healthOrientation: persona.healthOrientation,
    healthGoal: persona.healthGoal,
    easePreference: persona.easePreference,
    sustainabilityPriority: persona.sustainabilityPriority,
    wasteAvoidance: persona.wasteAvoidance,
  };
}

export function personaWithPreferences(id: string, preferences: ShopperPreferences): Persona {
  return { ...personaById(id), ...preferences };
}
