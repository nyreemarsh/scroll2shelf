import Image from "next/image";
import type { Finding, ModelContribution } from "@/lib/types";
import { ContributionBars } from "@/components/charts/ContributionBars";
import { Card } from "@/components/ui/Card";
import { InfoTooltip } from "@/components/ui/InfoTooltip";

interface ModelExplanationProps {
  contributions: ModelContribution[];
  note: string;
  finding: Finding;
}

export function ModelExplanation({
  contributions,
  note,
  finding,
}: ModelExplanationProps) {
  const selection = finding.metrics.find((metric) => metric.id === "selection");

  return (
    <Card className="p-6 sm:p-8">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:gap-14">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold tracking-tight text-plum">
              Signal contribution · {finding.product.name}
            </h3>
            <InfoTooltip text={note} />
          </div>
          <p className="mt-1.5 text-sm text-muted">
            How much each signal pushed this product up the ranking.
          </p>

          <div className="mt-7">
            <ContributionBars contributions={contributions} />
          </div>
        </div>

        <div className="rounded-lg border border-cerulean-100 bg-cerulean-50 p-5">
          <p className="eyebrow text-plum/65">Model output</p>
          <div className="mt-3 flex items-center gap-3">
            {finding.product.image ? (
              <span className="relative size-16 shrink-0 overflow-hidden rounded-md bg-white">
                <Image
                  src={finding.product.image}
                  alt=""
                  fill
                  sizes="64px"
                  className="object-contain p-1"
                />
              </span>
            ) : null}
            <p className="text-base font-semibold text-plum">
              {finding.product.name}
            </p>
          </div>
          {selection ? (
            <>
              <p className="mt-4 text-4xl font-semibold tracking-tight text-plum tabular-nums">
                {selection.value}
              </p>
              <p className="mt-1 text-xs text-muted">
                predicted selection likelihood
              </p>
            </>
          ) : null}
          <p className="mt-5 border-t border-cerulean-200 pt-4 text-xs leading-relaxed text-muted">
            {finding.stat.prefix}
            {finding.stat.value}
            {finding.stat.suffix} vs. category baseline. Figures are modelled,
            not measured sales.
          </p>
        </div>
      </div>
    </Card>
  );
}
