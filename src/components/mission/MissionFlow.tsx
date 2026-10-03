"use client";

import { useCallback, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { personaById } from "@/data/personas";
import {
  compareIntervention,
  runMonteCarlo,
  simulateMission,
} from "@/lib/simulation/engine";
import {
  DEFAULT_PARAMETERS,
  INTERVENTIONS,
  resolveParameters,
  type SimulationParameters,
} from "@/lib/simulation/parameters";
import type {
  InterventionComparison,
  SimulationSummary,
} from "@/lib/simulation/types";
import type { Course } from "@/lib/catalogue";
import { ConfigureStep } from "./ConfigureStep";
import { HomeOverview } from "./HomeOverview";
import { ResultsStep } from "./ResultsStep";
import { SimulateStep } from "./SimulateStep";
import { useMissionStep } from "./MissionStepContext";

const MONTE_CARLO_RUNS = 10_000;
/** Each comparison is two more full runs, so it gets a smaller budget. */
const COMPARISON_RUNS = 4_000;

interface CompletedRun {
  summary: SimulationSummary;
  parameters: SimulationParameters;
  courses: Course[];
  comparisons: InterventionComparison[];
}

export function MissionFlow({ seed }: { seed: number }) {
  const { step, direction, advanceTo, goTo } = useMissionStep();
  const reduceMotion = useReducedMotion();

  const [parameters, setParameters] =
    useState<SimulationParameters>(DEFAULT_PARAMETERS);
  const [run, setRun] = useState<CompletedRun | null>(null);

  const shopperA = personaById(parameters.shopperA);
  const shopperB = personaById(parameters.shopperB);
  const settings = useMemo(() => resolveParameters(parameters), [parameters]);

  const mission = useMemo(
    () => simulateMission(shopperA, shopperB, { seed, settings }),
    [shopperA, shopperB, seed, settings],
  );

  const updateParameters = useCallback((patch: Partial<SimulationParameters>) => {
    setParameters((current) => ({ ...current, ...patch }));
  }, []);

  // ~300ms for 10k runs, so it stays on the main thread rather than behind a
  // worker; the CTA covers the wait.
  const scaleUp = useCallback(() => {
    const summary = runMonteCarlo(shopperA, shopperB, {
      seed,
      runs: MONTE_CARLO_RUNS,
      settings,
    });
    const comparisons = INTERVENTIONS.map((intervention) =>
      compareIntervention(shopperA, shopperB, {
        seed,
        runs: COMPARISON_RUNS,
        settings,
        intervention,
      }),
    );
    setRun({ summary, parameters, courses: settings.courses, comparisons });
    advanceTo("results");
  }, [shopperA, shopperB, seed, settings, parameters, advanceTo]);

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
            onScaleUp={scaleUp}
          />
        ) : null}

        {step === "results" && run ? (
          <ResultsStep
            summary={run.summary}
            courses={run.courses}
            comparisons={run.comparisons}
            comparisonRuns={COMPARISON_RUNS}
            onBackToOverview={() => goTo("home")}
            onReconfigure={() => goTo("configure")}
          />
        ) : null}
      </motion.div>
    </AnimatePresence>
  );
}
