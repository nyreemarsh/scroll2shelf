"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { COURSE_LABEL } from "@/lib/simulation/courses";
import type {
  Candidate,
  CourseDecision,
  MissionResult,
  Persona,
  RoundResult,
} from "@/lib/simulation/types";
import { ArrowButton } from "@/components/ui/ArrowButton";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { formatPrice } from "@/lib/utils";
import { BasketTray } from "./BasketTray";
import { ProductCard } from "./ProductCard";
import { RoundTheatre } from "./RoundTheatre";

/** How many of the winner's ranked picks the shelf shows. */
const SHELF_SIZE = 4;
const HANDS_MS = 1600;

interface SimulateStepProps {
  mission: MissionResult;
  shopperA: Persona;
  shopperB: Persona;
  budget: number;
  onScaleUp: () => void;
}

/** The winner's top picks, always including the one that went in the basket. */
function shelfFor(round: RoundResult): Candidate[] {
  const ranked = round.suggestions[round.winner];
  const top = ranked.slice(0, SHELF_SIZE);
  const hasChosen = top.some(
    (candidate) => candidate.product.id === round.chosen.product.id,
  );
  return hasChosen ? top : [...top.slice(0, SHELF_SIZE - 1), round.chosen];
}

export function SimulateStep({
  mission,
  shopperA,
  shopperB,
  budget,
  onScaleUp,
}: SimulateStepProps) {
  const reduceMotion = useReducedMotion();
  const rounds = mission.rounds;

  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const done = index >= rounds.length;
  const round = done ? null : rounds[index];

  useEffect(() => {
    if (done || revealed) return;

    const timer = setTimeout(() => {
      setRevealed(true);
    }, reduceMotion ? 400 : HANDS_MS);

    return () => clearTimeout(timer);
  }, [done, revealed, reduceMotion, index]);

  const nextRound = () => {
    if (!revealed) return;
    setIndex((current) => current + 1);
    setRevealed(false);
  };

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Step 2"
        title="One simulated shop"
        description="The personas first decide which courses fit this shop. Rock paper scissors then decides who chooses each selected course, and every result pauses until you continue."
        action={
          !done ? (
            <Controls
              onNext={nextRound}
              disabled={!revealed}
              isLastRound={index === rounds.length - 1}
            />
          ) : null
        }
      />

      <CoursePlan decisions={mission.courseDecisions} />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px] lg:items-start">
        <div className="min-w-0 space-y-5">
          <AnimatePresence mode="wait">
            {round ? (
              <motion.div
                key={round.course}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
                className="space-y-5"
              >
                <div className="flex items-baseline gap-3">
                  <p className="eyebrow text-muted">
                    Round {index + 1} of {rounds.length}
                  </p>
                  <h3 className="text-lg font-semibold text-plum">
                    {COURSE_LABEL[round.course]}
                  </h3>
                </div>

                <RoundTheatre
                  round={round}
                  shopperA={shopperA}
                  shopperB={shopperB}
                  revealed={revealed}
                />

                {revealed ? (
                  <p className="text-center text-sm text-muted">
                    Paused after this round. Select Next when you&apos;re ready to continue.
                  </p>
                ) : null}

                <AnimatePresence>
                  {revealed ? (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35 }}
                    >
                      <p className="mb-3 text-sm text-muted">
                        Ranked from the{" "}
                        <span className="font-medium text-plum">
                          {COURSE_LABEL[round.course].toLowerCase()}
                        </span>{" "}
                        shelf at {" "}
                        <span className="font-medium text-plum">M&S</span>
                      </p>
                      <div className="space-y-4">
                        {Object.entries(
                          Object.groupBy(
                            shelfFor(round),
                            (candidate) => candidate.product.aisle,
                          ),
                        ).map(([aisle, candidates]) => (
                          <div key={aisle}>
                            <p className="eyebrow mb-2 text-cerulean">{aisle}</p>
                            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                              {candidates?.map((candidate) => (
                                <ProductCard
                                  key={candidate.product.id}
                                  candidate={candidate}
                                  chosen={candidate.product.id === round.chosen.product.id}
                                />
                              ))}
                            </div>
                          </div>
                        ))}
                        {round.additions.length > 0 ? (
                          <div className="rounded-lg border border-line bg-white px-4 py-3 text-xs text-plum">
                            <p className="font-semibold">Added to make the course complete for two</p>
                            {round.additions.map((item, index) => (
                              <div key={`${item.product.id}-${index}`} className="mt-2 flex items-center gap-2 text-muted">
                                <span className="relative size-9 shrink-0 overflow-hidden rounded-md bg-sand">
                                  <Image src={item.product.image} alt="" fill sizes="36px" className="object-contain p-0.5" />
                                </span>
                                <p>{item.product.name} · {item.reason} · {formatPrice(item.product.price)}</p>
                              </div>
                            ))}
                          </div>
                        ) : null}
                        {round.closeAlternative ? (
                          <div className="flex items-center gap-2 rounded-lg bg-sand/60 px-3 py-2 text-xs text-muted">
                            <span className="relative size-9 shrink-0 overflow-hidden rounded-md bg-white">
                              <Image src={round.closeAlternative.product.image} alt="" fill sizes="36px" className="object-contain p-0.5" />
                            </span>
                            <p>
                              Close alternative: <span className="font-medium text-plum">{round.closeAlternative.product.name}</span>
                              {round.closeAlternative.reasons[0] ? ` · ${round.closeAlternative.reasons[0].label}` : ""}
                            </p>
                          </div>
                        ) : null}
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </motion.div>
            ) : (
              <motion.div
                key="done"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-card border border-line bg-white p-8 text-center"
              >
                <p className="eyebrow text-muted">Simulated spend</p>
                <p className="mt-3 text-5xl font-semibold tracking-tight text-plum tabular-nums">
                  {formatPrice(mission.total)}
                </p>
                <p className="mx-auto mt-3 max-w-sm text-sm text-muted">
                  One modelled shop with {rounds.length}{" "}
                  {rounds.length === 1 ? "selected course" : "selected courses"}.
                  The personas were free to skip the rest. Run it thousands of
                  times to see which products hold up.
                </p>
                {mission.courseDecisions.some((decision) => !decision.selected) ? (
                  <p className="mx-auto mt-2 max-w-md text-xs text-muted">
                    Skipped: {mission.courseDecisions
                      .filter((decision) => !decision.selected)
                      .map((decision) => COURSE_LABEL[decision.course])
                      .join(", ")}.
                  </p>
                ) : null}
                {mission.total > budget ? (
                  <p className="mt-2 text-sm font-medium text-berry">
                    This couple went {formatPrice(mission.total - budget)} over their soft budget.
                  </p>
                ) : null}
                {mission.unavailableCourses.length > 0 ? (
                  <p className="mt-2 text-xs text-muted">
                    No complete product was available for {mission.unavailableCourses.join(", ")}.
                  </p>
                ) : null}
                <div className="mt-6 flex justify-center">
                  <ArrowButton
                    label="Run 10,000 simulations"
                    onClick={onScaleUp}
                    className="px-5 py-2.5"
                  />

                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="lg:sticky lg:top-24">
          <BasketTray
            rounds={rounds}
            resolved={done ? rounds.length : index + (revealed ? 1 : 0)}
            budget={budget}
          />
        </div>
      </div>
    </div>
  );
}

function CoursePlan({ decisions }: { decisions: CourseDecision[] }) {
  return (
    <div className="rounded-card border border-line bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-plum">Persona-led basket plan</p>
        <p className="text-xs text-muted">Courses can be selected or skipped</p>
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {decisions.map((decision) => (
          <div
            key={decision.course}
            className={`rounded-lg border px-3 py-2.5 ${
              decision.selected
                ? "border-cerulean-200 bg-cerulean-50"
                : "border-line bg-sand/45"
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-plum">
                {COURSE_LABEL[decision.course]}
              </p>
              <span className={`text-[11px] font-semibold uppercase tracking-wide ${
                decision.selected ? "text-cerulean" : "text-muted"
              }`}>
                {decision.selected ? "Picking" : "Skipping"}
              </span>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-muted">
              {decision.reason} {Math.round(decision.probability * 100)}% fit.
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Controls({
  onNext,
  disabled,
  isLastRound,
}: {
  onNext: () => void;
  disabled: boolean;
  isLastRound: boolean;
}) {
  const button =
    "inline-flex items-center gap-1.5 rounded-lg border border-line-strong px-3 py-2 text-sm font-medium text-plum transition-colors hover:bg-sand";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={onNext}
        disabled={disabled}
        className={`${button} disabled:cursor-not-allowed disabled:opacity-50`}
      >
        {isLastRound ? "View basket" : "Next"}
      </button>
    </div>
  );
}
