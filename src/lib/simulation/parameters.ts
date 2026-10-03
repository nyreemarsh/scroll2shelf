import {
  DEFAULT_SHOPPER_A,
  DEFAULT_SHOPPER_B,
  preferencesFor,
} from "@/data/personas";
import { MISSION_ORDER } from "./courses";
import { MODEL_CONFIG } from "./config";
import type { ModelSettings, ShopperPreferences } from "./types";

export interface SimulationParameters {
  shopperA: string;
  shopperB: string;
  preferencesA: ShopperPreferences;
  preferencesB: ShopperPreferences;
  budget: number;
  compromise: number;
  winnerControl: number;
  budgetFlexibility: number;
  sharingPreference: number;
}

export const BUDGET_RANGE = { min: 20, max: 100, step: 5 } as const;

export const DEFAULT_PARAMETERS: SimulationParameters = {
  shopperA: DEFAULT_SHOPPER_A,
  shopperB: DEFAULT_SHOPPER_B,
  preferencesA: preferencesFor(DEFAULT_SHOPPER_A),
  preferencesB: preferencesFor(DEFAULT_SHOPPER_B),
  budget: 45,
  compromise: 0.45,
  winnerControl: 0.8,
  budgetFlexibility: 0.35,
  sharingPreference: 0.7,
};

export function resolveParameters(parameters: SimulationParameters): ModelSettings {
  return {
    courses: [...MISSION_ORDER],
    budget: parameters.budget,
    couple: {
      compromise: parameters.compromise,
      winnerControl: parameters.winnerControl,
      budgetFlexibility: parameters.budgetFlexibility,
      sharingPreference: parameters.sharingPreference,
    },
    aisleExperiment: {
      enabled: false,
      aisleA: "",
      aisleB: "",
      effect: 0,
    },
    courseParticipation: { ...MODEL_CONFIG.courseParticipation },
  };
}
