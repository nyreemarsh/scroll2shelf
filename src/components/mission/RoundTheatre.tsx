"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { Move, Persona, RoundResult, ShopperId } from "@/lib/simulation/types";
import { cn } from "@/lib/utils";

const HAND: Record<Move, string> = {
  rock: "✊",
  paper: "✋",
  scissors: "✌️",
};

const MOVE_LABEL: Record<Move, string> = {
  rock: "Rock",
  paper: "Paper",
  scissors: "Scissors",
};

interface RoundTheatreProps {
  round: RoundResult;
  shopperA: Persona;
  shopperB: Persona;
  /** Hands shake while false, then settle on the deciding throw. */
  revealed: boolean;
}

export function RoundTheatre({
  round,
  shopperA,
  shopperB,
  revealed,
}: RoundTheatreProps) {
  const deciding = round.throws[round.throws.length - 1];
  const draws = round.throws.length - 1;

  return (
    <div className="rounded-card border border-line bg-white p-6 lg:p-8">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
        <Hand
          name={shopperA.name}
          move={deciding.a}
          revealed={revealed}
          won={revealed && !round.decidedJointly && round.winner === "a"}
          align="right"
        />

        <div className="text-center">
          <span className="eyebrow text-muted/70">vs</span>
        </div>

        <Hand
          name={shopperB.name}
          move={deciding.b}
          revealed={revealed}
          won={revealed && !round.decidedJointly && round.winner === "b"}
          align="left"
          mirrored
        />
      </div>

      <div className="mt-6 flex min-h-6 items-center justify-center gap-2 text-center">
        {revealed ? (
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-muted"
          >
            {round.decidedJointly ? (
              <>
                Decided <span className="font-medium text-plum">together</span>
              </>
            ) : (
              <>
                <span className="font-medium text-plum">
                  {winnerName(round.winner, shopperA, shopperB)}
                </span>{" "}
                wins · {Math.round(round.winnerInfluence * 100)}% influence on the pick
              </>
            )}
            {draws > 0 ? (
              <span className="text-muted">
                {" "}
                · after {draws} {draws === 1 ? "draw" : "draws"}
              </span>
            ) : null}
          </motion.p>
        ) : (
          <p className="text-sm text-muted">Throwing…</p>
        )}
      </div>
    </div>
  );
}

function winnerName(winner: ShopperId, a: Persona, b: Persona): string {
  return winner === "a" ? a.name : b.name;
}

function Hand({
  name,
  move,
  revealed,
  won,
  align,
  mirrored,
}: {
  name: string;
  move: Move;
  revealed: boolean;
  won: boolean;
  align: "left" | "right";
  mirrored?: boolean;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        align === "right" ? "items-end text-right" : "items-start text-left",
      )}
    >
      <motion.div
        animate={
          revealed || reduceMotion
            ? { rotate: 0, y: 0 }
            : { rotate: [0, -22, 0, -22, 0, -22, 0], y: [0, -6, 0, -6, 0, -6, 0] }
        }
        transition={
          revealed || reduceMotion
            ? { type: "spring", stiffness: 420, damping: 18 }
            : { duration: 0.9, repeat: Infinity, ease: "easeInOut" }
        }
        className={cn(
          "flex size-20 items-center justify-center rounded-full text-4xl transition-colors lg:size-24 lg:text-5xl",
          won ? "bg-popcorn" : "bg-sand",
          mirrored && "-scale-x-100",
        )}
      >
        <span className={cn(mirrored && "-scale-x-100 block")}>
          {revealed ? HAND[move] : HAND.rock}
        </span>
      </motion.div>

      <div>
        <p className="text-sm font-medium text-plum">{name}</p>
        <p className="mt-0.5 h-4 text-xs text-muted">
          {revealed ? MOVE_LABEL[move] : ""}
        </p>
      </div>
    </div>
  );
}
