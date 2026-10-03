"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { COURSE_LABEL } from "@/lib/simulation/courses";
import type { RoundResult } from "@/lib/simulation/types";
import { formatPrice } from "@/lib/utils";

interface BasketTrayProps {
  rounds: RoundResult[];
  /** Rounds resolved so far; later rounds stay hidden. */
  resolved: number;
}

export function BasketTray({ rounds, resolved }: BasketTrayProps) {
  const inBasket = rounds.slice(0, resolved);
  const total = inBasket.reduce(
    (sum, round) => sum + round.chosen.product.price,
    0,
  );

  return (
    <div className="rounded-card border border-line bg-white">
      <div className="border-b border-line px-5 py-3.5">
        <p className="eyebrow text-muted">Simulated basket</p>
      </div>

      <ul className="divide-y divide-line">
        <AnimatePresence initial={false}>
          {inBasket.map((round) => (
            <motion.li
              key={round.course}
              layout
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="flex items-center gap-3 overflow-hidden px-5 py-3"
            >
              <span className="relative size-10 shrink-0 overflow-hidden rounded-md bg-sand">
                <Image
                  src={round.chosen.product.image}
                  alt=""
                  fill
                  sizes="40px"
                  className="object-cover"
                />
              </span>
              <span className="min-w-0 flex-1">
                <span className="eyebrow block text-muted/80">
                  {COURSE_LABEL[round.course]}
                </span>
                <span className="mt-0.5 block truncate text-xs text-plum">
                  {round.chosen.product.name}
                </span>
              </span>
              <span className="shrink-0 text-sm font-medium text-plum tabular-nums">
                {formatPrice(round.chosen.product.price)}
              </span>
            </motion.li>
          ))}
        </AnimatePresence>

        {inBasket.length === 0 ? (
          <li className="px-5 py-6 text-center text-xs text-muted">
            Nothing picked yet.
          </li>
        ) : null}
      </ul>

      <div className="flex items-baseline justify-between border-t border-line px-5 py-4">
        <span className="text-sm text-muted">Total so far</span>
        <motion.span
          key={total}
          initial={{ opacity: 0.4 }}
          animate={{ opacity: 1 }}
          className="text-xl font-semibold text-plum tabular-nums"
        >
          {formatPrice(total)}
        </motion.span>
      </div>
    </div>
  );
}
