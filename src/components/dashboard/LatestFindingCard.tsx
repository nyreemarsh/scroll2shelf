import Image from "next/image";
import { CakeSlice, Sparkles } from "lucide-react";
import type { Finding } from "@/lib/types";
import { ArrowButton } from "@/components/ui/ArrowButton";
import { Chip } from "@/components/ui/Chip";
import { CountUp } from "@/components/ui/CountUp";
import { DotPattern } from "@/components/ui/DotPattern";
import { formatPrice } from "@/lib/utils";

function Headline({ text, emphasis }: { text: string; emphasis?: string }) {
  if (!emphasis || !text.includes(emphasis)) return <>{text}</>;
  const [before, ...rest] = text.split(emphasis);
  return (
    <>
      {before}
      <span className="bg-popcorn px-1.5 py-0.5 text-plum">{emphasis}</span>
      {rest.join(emphasis)}
    </>
  );
}

export function LatestFindingCard({ finding }: { finding: Finding }) {
  const selection = finding.metrics.find((metric) => metric.id === "selection");

  return (
    <article className="rounded-card border border-popcorn-200 bg-popcorn-50 p-6 sm:p-8 lg:p-11">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)] lg:gap-14">
        <div>
          <p className="eyebrow flex items-center gap-2 text-plum/70">
            <Sparkles className="size-3.5" strokeWidth={2.2} />
            {finding.label}
          </p>

          <h2 className="mt-5 max-w-[26ch] text-[1.75rem] leading-[1.18] font-semibold tracking-tight text-plum lg:text-[2.4rem]">
            <Headline text={finding.headline} emphasis={finding.emphasis} />
          </h2>

          <div className="mt-8 flex flex-col items-start gap-2 border-l-4 border-popcorn pl-5 sm:flex-row sm:items-end sm:gap-5">
            <CountUp
              {...finding.stat}
              className="text-[3.5rem] leading-[0.9] font-semibold tracking-tight text-plum tabular-nums lg:text-[4.5rem]"
            />
            <p className="max-w-[20ch] pb-1.5 text-sm text-muted">
              {finding.statCaption}
            </p>
          </div>

          <div className="mt-9">
            <p className="eyebrow text-muted">Why it&rsquo;s moving</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {finding.reasons.map((reason) => (
                <Chip key={reason} tone="popcorn">
                  {reason}
                </Chip>
              ))}
            </div>
          </div>

          <dl className="mt-9 grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-popcorn-200 bg-popcorn-200 sm:grid-cols-3">
            {finding.metrics.map((metric) => (
              <div key={metric.id} className="bg-popcorn-50 px-4 py-3.5">
                <dt className="sr-only">{metric.label}</dt>
                <dd>
                  <span className="block text-xl font-semibold tracking-tight text-plum">
                    {metric.value}
                  </span>
                  <span className="mt-0.5 block text-xs text-muted">
                    {metric.label}
                  </span>
                </dd>
              </div>
            ))}
          </dl>

          <ArrowButton label={finding.cta} className="mt-9" />
        </div>

        <div className="flex flex-col rounded-card border border-line bg-white p-5">
          <div className="relative flex min-h-[260px] flex-1 items-center justify-center overflow-hidden rounded-lg bg-sand/70">
            {finding.product.image ? (
              <Image
                src={finding.product.image}
                alt={finding.product.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 360px"
                className="object-contain p-5"
              />
            ) : (
              <>
                <div className="absolute inset-0 bg-plum" />
                <DotPattern className="opacity-20" />
                <CakeSlice
                  className="relative size-16 text-popcorn"
                  strokeWidth={1.1}
                />
              </>
            )}
            <span className="eyebrow absolute top-4 left-4 rounded-full bg-white/90 px-2.5 py-1 text-plum shadow-sm">
              {finding.product.category}
            </span>
          </div>

          <div className="mt-5 flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold tracking-tight text-plum">
                {finding.product.name}
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-muted">
                {finding.product.description}
              </p>
            </div>
            <span className="shrink-0 text-lg font-semibold tracking-tight text-plum tabular-nums">
              {formatPrice(finding.product.price)}
            </span>
          </div>

          {selection ? (
            <div className="mt-5 flex items-center justify-between border-t border-line pt-4">
              <span className="text-xs text-muted">{selection.label}</span>
              <Chip tone="popcorn">{selection.value}</Chip>
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}
