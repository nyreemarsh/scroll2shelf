"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { personaWithPreferences } from "@/data/personas";
import { runMonteCarlo, simulateMission } from "@/lib/simulation/engine";
import {
  DEFAULT_PARAMETERS,
  resolveParameters,
  type SimulationParameters,
} from "@/lib/simulation/parameters";
import type { SimulationSummary } from "@/lib/simulation/types";
import type { Course } from "@/lib/catalogue";
import { ConfigureStep } from "./ConfigureStep";
import { HomeOverview } from "./HomeOverview";
import { ResultsStep } from "./ResultsStep";
import { SimulateStep } from "./SimulateStep";
import { useMissionStep } from "./MissionStepContext";

const MONTE_CARLO_RUNS = 10_000;

interface CompletedRun {
  summary: SimulationSummary;
  parameters: SimulationParameters;
  courses: Course[];
  example: ReturnType<typeof simulateMission>;
}

const STORAGE_KEY = "scroll2shelf:simulation:v3";

export function MissionFlow({ seed }: { seed: number }) {
  const { step, direction, advanceTo, goTo } = useMissionStep();
  const reduceMotion = useReducedMotion();

  const [parameters, setParameters] =
    useState<SimulationParameters>(DEFAULT_PARAMETERS);
  const [run, setRun] = useState<CompletedRun | null>(null);
  const [hydrated, setHydrated] = useState(false);

  const shopperA = personaWithPreferences(parameters.shopperA, parameters.preferencesA);
  const shopperB = personaWithPreferences(parameters.shopperB, parameters.preferencesB);
  const settings = useMemo(() => resolveParameters(parameters), [parameters]);

  const mission = useMemo(
    () => simulateMission(shopperA, shopperB, { seed, settings }),
    [shopperA, shopperB, seed, settings],
  );

  const updateParameters = useCallback((patch: Partial<SimulationParameters>) => {
    setParameters((current) => ({ ...current, ...patch }));
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const saved = window.localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved) as Partial<SimulationParameters>;
          const supported = Object.fromEntries(
            Object.keys(DEFAULT_PARAMETERS)
              .filter((key) => key in parsed)
              .map((key) => [key, parsed[key as keyof SimulationParameters]]),
          ) as Partial<SimulationParameters>;
          setParameters((current) => ({ ...current, ...supported }));
        }
      } catch {
        // A malformed or unavailable local store should never block the demo.
      } finally {
        setHydrated(true);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(parameters));
  }, [hydrated, parameters]);

  // ~300ms for 10k runs, so it stays on the main thread rather than behind a
  // worker; the CTA covers the wait.
  const scaleUp = useCallback(() => {
    const summary = runMonteCarlo(shopperA, shopperB, {
      seed,
      runs: MONTE_CARLO_RUNS,
      settings,
    });
    setRun({
      summary,
      parameters,
      courses: settings.courses,
      example: mission,
    });
    advanceTo("results");
  }, [shopperA, shopperB, seed, settings, parameters, mission, advanceTo]);

  const offset = reduceMotion ? 0 : direction * 24;

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={step}
        initial={{ opacity: 0, x: offset }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -offset }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      >
        {step === "home" ? (
          <HomeOverview
            run={run}
            onExplore={() => goTo("results")}
            onReset={() => setRun(null)}
          />
        ) : null}

        {step === "configure" ? (
          <ConfigureStep
            parameters={parameters}
            onChange={updateParameters}
            onRun={() => advanceTo("simulate")}
          />
        ) : null}

        {step === "simulate" ? (
          <SimulateStep
            mission={mission}
            shopperA={shopperA}
            shopperB={shopperB}
            budget={parameters.budget}
            onScaleUp={scaleUp}
          />
        ) : null}

        {step === "results" && run ? (
          <ResultsStep
            summary={run.summary}
            courses={run.courses}
            example={run.example}
            onBackToOverview={() => goTo("home")}
            onReconfigure={() => goTo("configure")}
          />
        ) : null}
      </motion.div>
    </AnimatePresence>
  );
}
