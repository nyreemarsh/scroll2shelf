import { ArrowRight } from "lucide-react";
import type { Opportunity } from "@/lib/types";
import { ArrowButton } from "@/components/ui/ArrowButton";
import { CountUp } from "@/components/ui/CountUp";
import { cn } from "@/lib/utils";

export function OpportunityCard({ opportunity }: { opportunity: Opportunity }) {
  const featured = Boolean(opportunity.featured);

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col rounded-card border p-6 transition-all duration-300 hover:-translate-y-1",
        featured
          ? "border-popcorn-200 bg-popcorn-100 hover:border-popcorn sm:p-8"
          : "border-line bg-white hover:border-line-strong",
      )}
    >
      {opportunity.label ? (
        <span className="eyebrow self-start rounded bg-plum px-2 py-1 text-popcorn">
          {opportunity.label}
        </span>
      ) : (
        <ArrowRight className="absolute top-6 right-6 size-4 text-muted/50 transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-plum" />
      )}

      <h3
        className={cn(
          "font-semibold tracking-tight text-plum",
          featured ? "mt-5 max-w-[16ch] text-2xl" : "max-w-[18ch] pr-6 text-lg",
        )}
      >
        {opportunity.title}
      </h3>

      {opportunity.description ? (
        <p className="mt-3 max-w-[42ch] text-sm leading-relaxed text-muted">
          {opportunity.description}
        </p>
      ) : null}

      <div
        className={cn(
          "mt-auto",
          featured ? "pt-10" : "border-t border-line pt-5",
        )}
      >
        <CountUp
          {...opportunity.metric}
          className={cn(
            "block font-semibold tracking-tight text-plum tabular-nums",
            featured ? "text-5xl" : "text-[2.25rem]",
          )}
        />
        <p className="mt-1.5 text-xs text-muted">{opportunity.metricCaption}</p>
      </div>

      {opportunity.cta ? (
        <ArrowButton label={opportunity.cta} className="mt-6 self-start" />
      ) : null}
    </article>
  );
}
