"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type MissionStep = "home" | "configure" | "simulate" | "results";

export const MISSION_STEPS: MissionStep[] = [
  "home",
  "configure",
  "simulate",
  "results",
];

/** The three steps the progress indicator shows; the overview is not one. */
export const FLOW_STEPS: MissionStep[] = ["configure", "simulate", "results"];

export const STEP_LABEL: Record<MissionStep, string> = {
  home: "Overview",
  configure: "Configure",
  simulate: "Simulate",
  results: "Results",
};

/** Configure is always reachable — the run CTA is pinned to the top bar. */
const INITIAL_REACHED = MISSION_STEPS.indexOf("configure");

interface MissionStepValue {
  step: MissionStep;
  stepIndex: number;
  /** Furthest step unlocked so far; forward jumps beyond it are blocked. */
  reachedIndex: number;
  direction: number;
  isUnlocked: (step: MissionStep) => boolean;
  /** Navigate to an already-unlocked step. */
  goTo: (step: MissionStep) => void;
  /** Unlock and move forward — only CTAs should call this. */
  advanceTo: (step: MissionStep) => void;
}

const MissionStepContext = createContext<MissionStepValue | null>(null);

export function MissionStepProvider({ children }: { children: ReactNode }) {
  const [step, setStep] = useState<MissionStep>("home");
  const [reachedIndex, setReachedIndex] = useState(INITIAL_REACHED);
  const [direction, setDirection] = useState(1);

  const stepIndex = MISSION_STEPS.indexOf(step);

  const move = useCallback(
    (next: MissionStep) => {
      setDirection(MISSION_STEPS.indexOf(next) >= stepIndex ? 1 : -1);
      setStep(next);
    },
    [stepIndex],
  );

  const isUnlocked = useCallback(
    (candidate: MissionStep) => MISSION_STEPS.indexOf(candidate) <= reachedIndex,
    [reachedIndex],
  );

  const goTo = useCallback(
    (next: MissionStep) => {
      if (MISSION_STEPS.indexOf(next) > reachedIndex) return;
      move(next);
    },
    [move, reachedIndex],
  );

  const advanceTo = useCallback(
    (next: MissionStep) => {
      setReachedIndex((current) =>
        Math.max(current, MISSION_STEPS.indexOf(next)),
      );
      move(next);
    },
    [move],
  );

  const value = useMemo<MissionStepValue>(
    () => ({
      step,
      stepIndex,
      reachedIndex,
      direction,
      isUnlocked,
      goTo,
      advanceTo,
    }),
    [step, stepIndex, reachedIndex, direction, isUnlocked, goTo, advanceTo],
  );

  return (
    <MissionStepContext.Provider value={value}>
      {children}
    </MissionStepContext.Provider>
  );
}

export function useMissionStep(): MissionStepValue {
  const value = useContext(MissionStepContext);
  if (!value) {
    throw new Error("useMissionStep must be used inside MissionStepProvider");
  }
  return value;
}
