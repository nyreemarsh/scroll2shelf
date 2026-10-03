"use client";

import Image from "next/image";
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
import type { MissionResult, SimulationSummary } from "@/lib/simulation/types";
import { chartPalette } from "@/components/charts/palette";
import { ArrowButton, ArrowLink } from "@/components/ui/ArrowButton";
import { Card } from "@/components/ui/Card";
import { CountUp } from "@/components/ui/CountUp";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { formatBudget, formatPrice } from "@/lib/utils";
import { RankedShelf } from "./RankedShelf";

interface ResultsStepProps {
  summary: SimulationSummary;
  courses: Course[];
  example: MissionResult;
  onBackToOverview: () => void;
  onReconfigure: () => void;
}

export function ResultsStep({
  summary,
  courses,
  example,
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
        description={`Every figure is modelled, not measured sales. Simulated spend ranged from ${formatPrice(summary.minBasket)} to ${formatPrice(summary.maxBasket)}.`}
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
          label="shops over soft budget"
          value={summary.overBudgetRate * 100}
          suffix="%"
        />
        <Kpi
          label="average overspend when over"
          value={summary.averageOverspend}
          prefix="£"
          decimals={2}
        />
      </Card>

      <section>
        <SectionHeading
          eyebrow="Decision trace"
          title="One explainable basket"
          description="The exact seeded shop shown in the walkthrough, including skipped courses, the winning partner’s influence and the strongest reason behind each pick."
        />
        {example.courseDecisions.some((decision) => !decision.selected) ? (
          <Card className="mb-3 p-4">
            <p className="text-sm font-semibold text-plum">Courses they chose to skip</p>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {example.courseDecisions
                .filter((decision) => !decision.selected)
                .map((decision) => (
                  <p key={decision.course} className="text-xs leading-relaxed text-muted">
                    <span className="font-medium text-plum">{COURSE_LABEL[decision.course]}:</span>{" "}
                    {decision.reason}
                  </p>
                ))}
            </div>
          </Card>
        ) : null}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {example.rounds.map((round) => (
            <Card key={round.course} className="overflow-hidden">
              <div className="relative aspect-4/3 bg-sand/60">
                <Image
                  src={round.chosen.product.image}
                  alt={round.chosen.product.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 280px"
                  className="object-contain p-2"
                />
              </div>
              <div className="p-4">
              <p className="eyebrow text-cerulean">{COURSE_LABEL[round.course]} · {round.chosen.product.aisle}</p>
              <h3 className="mt-2 text-sm font-semibold leading-snug text-plum">{round.chosen.product.name}</h3>
              {round.additions.map((item, index) => (
                <div key={`${item.product.id}-${index}`} className="mt-2 flex items-center gap-2 text-xs text-muted">
                  <span className="relative size-8 shrink-0 overflow-hidden rounded-md bg-sand">
                    <Image src={item.product.image} alt="" fill sizes="32px" className="object-contain p-0.5" />
                  </span>
                  <p>+ {item.product.name} · {item.reason}</p>
                </div>
              ))}
              <p className="mt-2 text-xl font-semibold text-plum">
                {formatPrice(round.chosen.product.price + round.additions.reduce((sum, item) => sum + item.product.price, 0))}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-muted">
                Partner {round.winner.toUpperCase()} won with {Math.round(round.winnerInfluence * 100)}% influence
                {round.chosen.reasons[0] ? ` · ${round.chosen.reasons[0].label}` : ""}.
              </p>
              {round.closeAlternative ? (
                <div className="mt-3 flex items-center gap-2 border-t border-line pt-3 text-xs text-muted">
                  <span className="relative size-8 shrink-0 overflow-hidden rounded-md bg-sand">
                    <Image src={round.closeAlternative.product.image} alt="" fill sizes="32px" className="object-contain p-0.5" />
                  </span>
                  <p>Nearly chose: {round.closeAlternative.product.name}</p>
                </div>
              ) : null}
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <SectionHeading
          eyebrow="Ranked"
          title="Best date night foods"
          description="The lead product picked most often for each course. Portions and accompaniments are included in basket spend."
        />
        <RankedShelf summary={summary} courses={courses} />
      </section>

      <section>
        <SectionHeading
          eyebrow="Basket relationships"
          title="Common pairings and complete baskets"
          description="Products that repeatedly appeared together across the same simulated shop."
        />
        <div className="grid gap-5 lg:grid-cols-2">
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-plum">Frequent product pairings</h3>
            <div className="mt-4 divide-y divide-line">
              {summary.commonPairings.slice(0, 5).map((pairing) => (
                <div key={`${pairing.products[0].id}-${pairing.products[1].id}`} className="flex items-center justify-between gap-4 py-3 first:pt-0">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex shrink-0 -space-x-2">
                      {pairing.products.map((product) => (
                        <span key={product.id} className="relative size-10 overflow-hidden rounded-full border-2 border-white bg-sand">
                          <Image src={product.image} alt="" fill sizes="40px" className="object-contain p-0.5" />
                        </span>
                      ))}
                    </div>
                    <p className="text-xs leading-relaxed text-plum">
                      {pairing.products[0].name} <span className="text-muted">+</span> {pairing.products[1].name}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs font-medium text-cerulean">{(pairing.share * 100).toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </Card>
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-plum">Most common full baskets</h3>
            <div className="mt-4 divide-y divide-line">
              {summary.commonBaskets.slice(0, 4).map((basket, index) => (
                <div key={`${index}-${basket.products.map((product) => product.id).join("-")}`} className="py-3 first:pt-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="mb-2 flex -space-x-1.5">
                        {basket.products.slice(0, 6).map((product) => (
                          <span key={product.id} className="relative size-9 overflow-hidden rounded-md border border-white bg-sand">
                            <Image src={product.image} alt="" fill sizes="36px" className="object-contain p-0.5" />
                          </span>
                        ))}
                      </div>
                      <p className="text-xs leading-relaxed text-plum">{basket.products.map((product) => product.name).join(" · ")}</p>
                    </div>
                    <span className="shrink-0 text-xs font-medium text-cerulean">{(basket.share * 100).toFixed(1)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

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
