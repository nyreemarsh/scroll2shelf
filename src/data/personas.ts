import type { Persona } from "@/lib/simulation/types";

/**
 * Shopper archetypes used by the mission simulator. Traits are 0–1 and are
 * matched against product attributes; budget is in £ for one shopper.
 */
export const personas: Persona[] = [
  {
    id: "trend-led-foodie",
    name: "Trend-Led Foodie",
    tagline: "Follows food culture and trades up for whatever is having a moment.",
    budget: 40,
    noveltySeeking: 0.82,
    indulgence: 0.74,
    priceSensitivity: 0.31,
    trendAffinity: 0.91,
    premiumPreference: 0.68,
    healthOrientation: 0.35,
  },
  {
    id: "comfort-food-lover",
    name: "Comfort Food Lover",
    tagline: "Sticks with familiar favourites and generous, shareable portions.",
    budget: 32,
    noveltySeeking: 0.38,
    indulgence: 0.86,
    priceSensitivity: 0.54,
    trendAffinity: 0.42,
    premiumPreference: 0.45,
    healthOrientation: 0.22,
  },
  {
    id: "budget-date",
    name: "Budget Date",
    tagline: "Wants the full five courses without the premium price tag.",
    budget: 26,
    noveltySeeking: 0.46,
    indulgence: 0.52,
    priceSensitivity: 0.89,
    trendAffinity: 0.5,
    premiumPreference: 0.16,
    healthOrientation: 0.44,
  },
  {
    id: "premium-occasion",
    name: "Premium Occasion",
    tagline: "Treats date night as an occasion worth spending properly on.",
    budget: 55,
    noveltySeeking: 0.6,
    indulgence: 0.78,
    priceSensitivity: 0.12,
    trendAffinity: 0.55,
    premiumPreference: 0.94,
    healthOrientation: 0.33,
  },
];

export const DEFAULT_SHOPPER_A = "trend-led-foodie";
export const DEFAULT_SHOPPER_B = "comfort-food-lover";

export function personaById(id: string): Persona {
  return personas.find((persona) => persona.id === id) ?? personas[0];
}
