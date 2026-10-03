import { Fragment } from "react";
import { ArrowDown } from "lucide-react";
import type { SimulationPreview as SimulationPreviewData } from "@/lib/types";
import { ArrowButton } from "@/components/ui/ArrowButton";
import { Chip } from "@/components/ui/Chip";

function Meter({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex items-center justify-between text-[11px] text-cream/50">
        <span>{label}</span>
        <span className="tabular-nums">{value.toFixed(2)}</span>
      </div>
      <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-cerulean"
          style={{ width: `${Math.round(value * 100)}%` }}
        />
      </div>
    </div>
  );
}

export function SimulationPreview({
  simulation,
}: {
  simulation: SimulationPreviewData;
}) {
  const { shoppers, round } = simulation;
  const winner = shoppers.find((shopper) => shopper.id === round.winnerId);

  return (
    <div className="rounded-card bg-plum p-6 text-cream sm:p-8 lg:p-10">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-14">
        <div className="flex flex-col">
          <p className="max-w-[40ch] text-sm leading-relaxed text-cream/65">
            Every recommendation is traced back to a simulated decision path.
            Two modelled shoppers play for each course, and the winner picks.
          </p>

          <div className="mt-7 flex items-stretch gap-3">
            {shoppers.map((shopper, index) => (
              <Fragment key={shopper.id}>
                {index > 0 ? (
                  <div className="flex items-center text-[10px] font-semibold tracking-[0.2em] text-cream/35">
                    VS
                  </div>
                ) : null}
                <div className="flex-1 rounded-lg border border-white/12 bg-white/5 p-4">
                  <p className="eyebrow text-cream/45">{shopper.slot}</p>
                  <p className="mt-1.5 text-base font-semibold text-cream">
                    {shopper.persona.name}
                  </p>
                  <div className="mt-4 space-y-2.5">
                    <Meter
                      label="Trend affinity"
                      value={shopper.persona.trendAffinity}
                    />
                    <Meter
                      label="Indulgence"
                      value={shopper.persona.indulgence}
                    />
                  </div>
                </div>
              </Fragment>
            ))}
          </div>

          <div className="mt-8">
            <ArrowButton label={simulation.cta} tone="popcorn" />
          </div>
        </div>

        <div className="rounded-lg border border-white/12 bg-white/5 p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <span className="eyebrow text-cream/45">{round.label}</span>
            <Chip tone="onDark" className="tracking-[0.14em] uppercase">
              {round.course}
            </Chip>
          </div>

          <div className="mt-6 flex items-start justify-center gap-6">
            {round.moves.map((move, index) => (
              <Fragment key={move.shopperId}>
                {index > 0 ? (
                  <span className="pt-6 text-xs text-cream/35">vs</span>
                ) : null}
                <div className="text-center">
                  <div className="flex size-16 items-center justify-center rounded-xl border border-white/12 bg-plum text-[28px] leading-none">
                    {move.glyph}
                  </div>
                  <p className="mt-2 text-[11px] tracking-wide text-cream/50 uppercase">
                    {move.gesture}
                  </p>
                </div>
              </Fragment>
            ))}
          </div>

          <p className="mt-5 text-center text-sm font-semibold text-popcorn">
            {winner ? `${winner.slot} wins` : "Round complete"}
          </p>

          <div className="my-4 flex justify-center">
            <ArrowDown className="size-4 text-cream/30" />
          </div>

          <div className="rounded-lg border border-popcorn/30 bg-popcorn/10 px-4 py-3.5 text-center">
            <p className="text-sm font-semibold text-cream">{round.outcome}</p>
            <p className="mt-1 text-xs text-cream/55">
              {round.probability}% selection probability
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
