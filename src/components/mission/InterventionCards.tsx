"use client";

import { TrendingUp } from "lucide-react";
import type { InterventionComparison } from "@/lib/simulation/types";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { formatPrice } from "@/lib/utils";

interface InterventionCardsProps {
  comparisons: InterventionComparison[];
  runs: number;
}

/**
 * Each card is two Monte Carlo runs on the same seed, differing by one
 * threshold. The uplift is the subtraction between them — it is never written
 * down — and the assumption it rests on sits directly underneath.
 */
export function InterventionCards({
  comparisons,
  runs,
}: InterventionCardsProps) {
  const ranked = [...comparisons].sort((a, b) => b.upliftAbs - a.upliftAbs);

  return (
    <div className="grid gap-5 md:grid-cols-2">
      {ranked.map((comparison, index) => {
        const { intervention, baseline, withIntervention, upliftAbs, upliftPct } =
          comparison;
        const positive = upliftAbs > 0;

        return (
          <Card key={intervention.id} className="flex flex-col p-5">
            <div className="mb-4 flex items-start justify-between gap-3">
              <h3 className="text-sm leading-snug font-semibold text-plum">
                {intervention.label}
              </h3>
              {index === 0 && positive ? (
                <Chip tone="popcorn">Highest uplift</Chip>
              ) : null}
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-semibold tracking-tight text-plum tabular-nums">
                {positive ? "+" : ""}
                {formatPrice(upliftAbs)}
              </span>
              <span className="text-sm text-muted tabular-nums">
                {positive ? "+" : ""}
                {(upliftPct * 100).toFixed(1)}%
              </span>
            </div>
            <p className="mt-1 text-xs text-muted">
              on the average simulated basket
            </p>

            <dl className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-lg bg-line">
              <div className="bg-white p-3">
                <dt className="text-xs text-muted">Without</dt>
                <dd className="mt-0.5 text-sm font-medium text-plum tabular-nums">
                  {formatPrice(baseline.averageBasket)}
                </dd>
              </div>
              <div className="bg-white p-3">
                <dt className="text-xs text-muted">With</dt>
                <dd className="mt-0.5 text-sm font-medium text-plum tabular-nums">
                  {formatPrice(withIntervention.averageBasket)}
                </dd>
              </div>
            </dl>

            <div className="mt-auto flex items-start gap-2 border-t border-line pt-3.5">
              <TrendingUp
                className="mt-px size-3.5 shrink-0 text-muted"
                strokeWidth={2}
              />
              <p className="text-xs leading-relaxed text-muted">
                {intervention.assumption}. Measured over{" "}
                {runs.toLocaleString("en-GB")} paired runs on the same seed, so
                both sides played identical throws.
              </p>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
