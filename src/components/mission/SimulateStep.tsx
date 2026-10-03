"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Pause, Play, SkipForward } from "lucide-react";
import { COURSE_LABEL } from "@/lib/simulation/courses";
import type {
  Candidate,
  MissionResult,
  Persona,
  RoundResult,
} from "@/lib/simulation/types";
import { ArrowButton } from "@/components/ui/ArrowButton";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cn, formatPrice } from "@/lib/utils";
import { BasketTray } from "./BasketTray";
import { ProductCard } from "./ProductCard";
import { RoundTheatre } from "./RoundTheatre";

/** How many of the winner's ranked picks the shelf shows. */
const SHELF_SIZE = 4;
const HANDS_MS = 1600;
const SHELF_MS = 2800;

interface SimulateStepProps {
  mission: MissionResult;
  shopperA: Persona;
  shopperB: Persona;
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
  onScaleUp,
}: SimulateStepProps) {
  const reduceMotion = useReducedMotion();
  const rounds = mission.rounds;

  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);

  const done = index >= rounds.length;
  const round = done ? null : rounds[index];

  useEffect(() => {
    if (done || !playing) return;

    const delay = reduceMotion
      ? 400
      : (revealed ? SHELF_MS : HANDS_MS) / speed;

    const timer = setTimeout(() => {
      if (revealed) {
        setIndex((current) => current + 1);
        setRevealed(false);
      } else {
        setRevealed(true);
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [done, playing, revealed, speed, reduceMotion, index]);

  const skipToBasket = () => {
    setPlaying(false);
    setIndex(rounds.length);
    setRevealed(false);
  };

  const nextRound = () => {
    if (!revealed) {
      setRevealed(true);
      return;
    }
    setIndex((current) => current + 1);
    setRevealed(false);
  };

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Step 2"
        title="One simulated shop"
        description="Rock paper scissors decides who picks each course, then the model ranks the shelf for whoever won."
        action={
          !done ? (
            <Controls
              playing={playing}
              speed={speed}
              onTogglePlay={() => setPlaying((value) => !value)}
              onNext={nextRound}
              onSkip={skipToBasket}
              onSpeed={() => setSpeed((value) => (value === 1 ? 2 : 1))}
            />
          ) : null
        }
      />

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
                      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                        {shelfFor(round).map((candidate) => (
                          <ProductCard
                            key={candidate.product.id}
                            candidate={candidate}
                            chosen={
                              candidate.product.id === round.chosen.product.id
                            }
                          />
                        ))}
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
                  One modelled shop across {rounds.length}{" "}
                  {rounds.length === 1 ? "course" : "courses"}. Run it thousands
                  of times to see which products hold up.
                </p>
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
          />
        </div>
      </div>
    </div>
  );
}

function Controls({
  playing,
  speed,
  onTogglePlay,
  onNext,
  onSkip,
  onSpeed,
}: {
  playing: boolean;
  speed: number;
  onTogglePlay: () => void;
  onNext: () => void;
  onSkip: () => void;
  onSpeed: () => void;
}) {
  const button =
    "inline-flex items-center gap-1.5 rounded-lg border border-line-strong px-3 py-2 text-sm font-medium text-plum transition-colors hover:bg-sand";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button type="button" onClick={onTogglePlay} className={button}>
        {playing ? (
          <Pause className="size-3.5" strokeWidth={2.2} />
        ) : (
          <Play className="size-3.5" strokeWidth={2.2} />
        )}
        {playing ? "Pause" : "Play"}
      </button>
      <button type="button" onClick={onNext} className={button}>
        Next
      </button>
      <button
        type="button"
        onClick={onSpeed}
        className={cn(button, speed === 2 && "bg-popcorn-100 border-popcorn-200")}
      >
        {speed}×
      </button>
      <button type="button" onClick={onSkip} className={button}>
        <SkipForward className="size-3.5" strokeWidth={2.2} />
        Skip
      </button>
    </div>
  );
}
