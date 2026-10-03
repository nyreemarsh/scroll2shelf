"use client";

import { RotateCcw } from "lucide-react";
import type { Course } from "@/lib/catalogue";
import {
  dataFreshness,
  dataSignals,
  detectedTrend,
  latestFinding,
  retailer,
  retailerOpportunities,
  timeRanges,
} from "@/data/mockData";
import { moodById, type SimulationParameters } from "@/lib/simulation/parameters";
import type { SimulationSummary } from "@/lib/simulation/types";
import { personaById } from "@/data/personas";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { DataSources } from "@/components/dashboard/DataSources";
import { LatestFindingCard } from "@/components/dashboard/LatestFindingCard";
import { OpportunityCard } from "@/components/dashboard/OpportunityCard";
import { TrendOverview } from "@/components/dashboard/TrendOverview";
import { ArrowLink } from "@/components/ui/ArrowButton";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { CountUp } from "@/components/ui/CountUp";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { formatBudget } from "@/lib/utils";
import { RankedShelf } from "./RankedShelf";

interface CompletedRun {
  summary: SimulationSummary;
  parameters: SimulationParameters;
  courses: Course[];
}

interface HomeOverviewProps {
  /** Null until the retailer has run the model at least once. */
  run: CompletedRun | null;
  onExplore: () => void;
  onReset: () => void;
}

export function HomeOverview({ run, onExplore, onReset }: HomeOverviewProps) {
  return (
    <div className="space-y-14 lg:space-y-20">
      <DashboardHeader
        retailer={retailer}
        title="Good morning. Here's what's moving."
        ranges={timeRanges}
        freshness={dataFreshness}
      />

      {run ? (
        <RunInsights run={run} onExplore={onExplore} onReset={onReset} />
      ) : (
        <section>
          <SectionHeading
            eyebrow="Latest finding"
            title="What the model surfaced overnight"
          />
          <LatestFindingCard finding={latestFinding} />
        </section>
      )}

      <section>
        <SectionHeading
          eyebrow="Trend signal"
          title="Emerging shopping missions"
          description="Social behaviour we have detected and translated into a structured shopping journey."
        />
        <TrendOverview trend={detectedTrend} />
      </section>

      {run ? null : (
        <section>
          <SectionHeading
            eyebrow="Opportunities"
            title="Worth testing"
            description="Each one is a hypothesis the simulator can price before anyone commits shelf space."
          />
          <div className="grid gap-5 md:grid-cols-3">
            {retailerOpportunities.map((opportunity) => (
              <OpportunityCard key={opportunity.id} opportunity={opportunity} />
            ))}
          </div>
        </section>
      )}

      <DataSources signals={dataSignals} />
    </div>
  );
}

function RunInsights({
  run,
  onExplore,
  onReset,
}: {
  run: CompletedRun;
  onExplore: () => void;
  onReset: () => void;
}) {
  const { summary, parameters, courses } = run;
  const shopperA = personaById(parameters.shopperA);
  const shopperB = personaById(parameters.shopperB);
  const mood = moodById(parameters.mood);

  return (
    <section>
      <SectionHeading
        eyebrow="Your simulation"
        title="Best date night foods, ranked"
        description={`Modelled across ${summary.runs.toLocaleString("en-GB")} simulated shops. These are predictions, not measured sales.`}
        action={
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-plum"
          >
            <RotateCcw className="size-3.5" strokeWidth={2} />
            Reset to the default view
          </button>
        }
      />

      <div className="mb-5 flex flex-wrap gap-2">
        <Chip tone="popcorn">
          {shopperA.name} vs {shopperB.name}
        </Chip>
        <Chip tone="cerulean">{mood.label}</Chip>
        <Chip>{formatBudget(parameters.budget)} budget</Chip>
        <Chip>{Math.round(parameters.trendExposure * 100)}% trend exposure</Chip>
        {parameters.dealHunting ? <Chip>Deal hunting</Chip> : null}
        {parameters.dietary ? <Chip>{parameters.dietary}</Chip> : null}
      </div>

      <Card className="mb-5 grid grid-cols-2 divide-line sm:grid-cols-4 sm:divide-x">
        <HomeKpi
          label="average simulated basket"
          value={summary.averageBasket}
          prefix="£"
          decimals={2}
        />
        <HomeKpi
          label="median simulated basket"
          value={summary.medianBasket}
          prefix="£"
          decimals={2}
        />
        <HomeKpi
          label="premium product share"
          value={summary.premiumShare * 100}
          suffix="%"
        />
        <HomeKpi label="simulations run" value={summary.runs} />
      </Card>

      <RankedShelf summary={summary} courses={courses} />

      <div className="mt-6">
        <ArrowLink label="Explore the full results" onClick={onExplore} />
      </div>
    </section>
  );
}

function HomeKpi({
  label,
  value,
  prefix,
  suffix,
  decimals = 0,
}: {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}) {
  return (
    <div className="border-b border-line p-5 last:border-b-0 sm:border-b-0">
      <p className="text-2xl font-semibold tracking-tight text-plum tabular-nums">
        <CountUp
          value={value}
          prefix={prefix}
          suffix={suffix}
          decimals={decimals}
        />
      </p>
      <p className="mt-1 text-xs text-muted">{label}</p>
    </div>
  );
}
