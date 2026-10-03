"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Course } from "@/lib/catalogue";
import { COURSE_LABEL } from "@/lib/simulation/courses";
import type {
  InterventionComparison,
  SimulationSummary,
} from "@/lib/simulation/types";
import { chartPalette } from "@/components/charts/palette";
import { ArrowButton, ArrowLink } from "@/components/ui/ArrowButton";
import { Card } from "@/components/ui/Card";
import { CountUp } from "@/components/ui/CountUp";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { formatBudget } from "@/lib/utils";
import { InterventionCards } from "./InterventionCards";
import { RankedShelf } from "./RankedShelf";

interface ResultsStepProps {
  summary: SimulationSummary;
  courses: Course[];
  comparisons: InterventionComparison[];
  comparisonRuns: number;
  onBackToOverview: () => void;
  onReconfigure: () => void;
}

export function ResultsStep({
  summary,
  courses,
  comparisons,
  comparisonRuns,
  onBackToOverview,
  onReconfigure,
}: ResultsStepProps) {
  const spend = summary.categorySpend
    .filter((entry) => entry.spend > 0)
    .map((entry) => ({
      course: COURSE_LABEL[entry.course],
      spend: Number(entry.spend.toFixed(2)),
    }));

  return (
    <div className="space-y-10">
      <SectionHeading
        eyebrow="Step 3"
        title="What 10,000 simulated shops predict"
        description="Every figure here is modelled from the shelf and the TikTok sample. None of it is measured sales."
      />

      <Card className="grid grid-cols-2 divide-line sm:grid-cols-4 sm:divide-x">
        <Kpi
          label="average simulated basket"
          value={summary.averageBasket}
          prefix="£"
          decimals={2}
        />
        <Kpi
          label="median simulated basket"
          value={summary.medianBasket}
          prefix="£"
          decimals={2}
        />
        <Kpi
          label="premium product share"
          value={summary.premiumShare * 100}
          suffix="%"
        />
        <Kpi label="simulations run" value={summary.runs} />
      </Card>

      <section>
        <SectionHeading
          eyebrow="Ranked"
          title="Best date night foods"
          description="The products that won each course most often across every simulated night."
        />
        <RankedShelf summary={summary} courses={courses} />
      </section>

      {comparisons.length > 0 ? (
        <section>
          <SectionHeading
            eyebrow="Interventions"
            title="Worth testing"
            description="Each one re-runs the same nights with a single threshold moved, so the difference is the intervention and nothing else."
          />
          <InterventionCards
            comparisons={comparisons}
            runs={comparisonRuns}
          />
        </section>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-plum">
            Simulated basket value
          </h3>
          <p className="mt-1 text-xs text-muted">
            How often the night landed in each spend band.
          </p>
          <div className="mt-5 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={summary.histogram}
                margin={{ top: 4, right: 4, bottom: 4, left: -18 }}
              >
                <CartesianGrid
                  vertical={false}
                  stroke={chartPalette.line}
                />
                <XAxis
                  dataKey="bucket"
                  tick={{ fontSize: 10, fill: chartPalette.muted }}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fontSize: 10, fill: chartPalette.muted }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  cursor={{ fill: chartPalette.line }}
                  contentStyle={{
                    borderRadius: 10,
                    border: `1px solid ${chartPalette.stroke}`,
                    fontSize: 12,
                  }}
                />
                <Bar
                  dataKey="count"
                  name="Simulated nights"
                  fill={chartPalette.cerulean}
                  radius={[3, 3, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="text-sm font-semibold text-plum">
            Average spend per course
          </h3>
          <p className="mt-1 text-xs text-muted">
            Where the night&rsquo;s money goes, averaged over every run.
          </p>
          <div className="mt-5 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={spend}
                layout="vertical"
                margin={{ top: 4, right: 16, bottom: 4, left: 12 }}
              >
                <CartesianGrid
                  horizontal={false}
                  stroke={chartPalette.line}
                />
                <XAxis
                  type="number"
                  tick={{ fontSize: 10, fill: chartPalette.muted }}
                  tickFormatter={(value) => formatBudget(Number(value))}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="course"
                  width={64}
                  tick={{ fontSize: 11, fill: chartPalette.muted }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  cursor={{ fill: chartPalette.line }}
                  contentStyle={{
                    borderRadius: 10,
                    border: `1px solid ${chartPalette.stroke}`,
                    fontSize: 12,
                  }}
                />
                <Bar
                  dataKey="spend"
                  name="Average spend £"
                  fill={chartPalette.plum}
                  radius={[0, 3, 3, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-5 border-t border-line pt-8">
        <ArrowButton
          label="See it on the overview"
          onClick={onBackToOverview}
          className="px-5 py-2.5"
        />
        <ArrowLink label="Change the parameters" onClick={onReconfigure} />
      </div>
    </div>
  );
}

function Kpi({
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