"use client";

import { useMemo } from "react";
import evidence from "@/data/evidence.json";
import { catalogueMeta } from "@/lib/catalogue";
import {
  BUDGET_RANGE,
  COURSE_PRESETS,
  DEALS_EVIDENCE,
  DECISION_STYLES,
  MOODS,
  dietaryOptions,
  type SimulationParameters,
} from "@/lib/simulation/parameters";
import type { DecisionStyleId } from "@/lib/simulation/types";
import { ArrowButton } from "@/components/ui/ArrowButton";
import { Card } from "@/components/ui/Card";
import { ChoiceList } from "@/components/ui/ChoiceList";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Slider } from "@/components/ui/Slider";
import { COURSE_LABEL } from "@/lib/simulation/courses";
import { formatBudget, formatPrice } from "@/lib/utils";
import { ParameterCard } from "./ParameterCard";
import { PersonaPicker } from "./PersonaPicker";

const NO_DIETARY = "none";

interface ConfigureStepProps {
  parameters: SimulationParameters;
  onChange: (patch: Partial<SimulationParameters>) => void;
  onRun: () => void;
}

export function ConfigureStep({
  parameters,
  onChange,
  onRun,
}: ConfigureStepProps) {
  const dietary = useMemo(() => dietaryOptions(), []);
  const selectedDietary = dietary.find((o) => o.id === parameters.dietary);

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Step 1"
        title="Set up the shop"
        description="Each control below moves the model. Every one is either measured from the TikTok sample or an assumption we state outright."
      />

      <Card className="p-6">
        <h3 className="text-sm font-semibold text-plum">Who is shopping?</h3>
        <p className="mt-1 text-xs text-muted">
          Two archetypes play rock paper scissors for each course.
        </p>
        <div className="mt-5 grid gap-8 md:grid-cols-2">
          <PersonaPicker
            slot="Shopper A"
            value={parameters.shopperA}
            onChange={(shopperA) => onChange({ shopperA })}
          />
          <PersonaPicker
            slot="Shopper B"
            value={parameters.shopperB}
            onChange={(shopperB) => onChange({ shopperB })}
          />
        </div>
      </Card>

      <div className="grid gap-5 lg:grid-cols-3">
        <ParameterCard
          label="Budget for the night"
          hint="Spread across the courses in play."
          provenance="assumption"
          evidence={`The one basket total we could read off a post came to ${formatPrice(
            evidence.basketTotalsSeen[0]?.total ?? 0,
          )}.`}
        >
          <Slider
            label="Budget for the night"
            value={parameters.budget}
            min={BUDGET_RANGE.min}
            max={BUDGET_RANGE.max}
            step={BUDGET_RANGE.step}
            onChange={(budget) => onChange({ budget })}
            display={formatBudget(parameters.budget)}
            minLabel={formatBudget(BUDGET_RANGE.min)}
            maxLabel={formatBudget(BUDGET_RANGE.max)}
          />
        </ParameterCard>

        <ParameterCard
          label="Trend exposure"
          hint="How much a product's TikTok signal sways the pick."
          provenance="data"
          evidence={`${catalogueMeta.tiktokProductsInCatalogue} of the ${catalogueMeta.catalogueProducts} products on the shelf were seen in the sample.`}
        >
          <Slider
            label="Trend exposure"
            value={parameters.trendExposure}
            min={0}
            max={1}
            step={0.1}
            onChange={(trendExposure) => onChange({ trendExposure })}
            display={`${Math.round(parameters.trendExposure * 100)}%`}
            minLabel="Ignore the trend"
            maxLabel="Follow it closely"
          />
        </ParameterCard>

        <ParameterCard
          label="Deal hunting"
          hint="Shoppers actively looking for a multibuy."
          provenance="data"
          evidence={`${DEALS_EVIDENCE.posts} of ${DEALS_EVIDENCE.totalPosts} posts used a deal, including ${DEALS_EVIDENCE.examples
            .slice(0, 2)
            .join(" and ")}.`}
        >
          <ChoiceList
            name="Deal hunting"
            value={parameters.dealHunting ? "on" : "off"}
            onChange={(id) => onChange({ dealHunting: id === "on" })}
            choices={[
              { id: "off", label: "Shopping as normal" },
              {
                id: "on",
                label: "Hunting for deals",
                description: "Sharpens price sensitivity.",
              },
            ]}
          />
        </ParameterCard>

        <ParameterCard
          label="Mood"
          hint="Shifts what the couple is optimising for."
          provenance="assumption"
          evidence="Preset weightings on indulgence, premium and the date-night bonus."
          className="lg:row-span-2"
        >
          <ChoiceList
            name="Mood"
            value={parameters.mood}
            onChange={(mood) => onChange({ mood: mood as SimulationParameters["mood"] })}
            choices={MOODS.map((mood) => ({
              id: mood.id,
              label: mood.label,
              description: mood.description,
            }))}
          />
        </ParameterCard>

        <ParameterCard
          label="Courses in play"
          hint="Which rounds the couple shops for."
          provenance="data"
          evidence={`The journeys actually followed across the ${evidence.posts} posts. ${Math.round(
            evidence.startsWithStarter * 100,
          )}% opened with the starter.`}
          className="lg:row-span-2"
        >
          <ChoiceList
            name="Courses in play"
            value={parameters.coursePreset}
            onChange={(coursePreset) => onChange({ coursePreset })}
            choices={COURSE_PRESETS.map((preset) => ({
              id: preset.id,
              label: preset.label,
              meta: preset.posts > 0 ? `${preset.posts} posts` : "unseen",
            }))}
          />
        </ParameterCard>

        <ParameterCard
          label="Who decides"
          hint="How the win is settled each round."
          provenance="data"
          evidence={`Scored across ${evidence.decidingRounds} rounds in the sample.`}
        >
          <ChoiceList
            name="Who decides"
            value={parameters.decisionStyle}
            onChange={(id) => onChange({ decisionStyle: id as DecisionStyleId })}
            choices={DECISION_STYLES.map((style) => ({
              id: style.id,
              label: style.label,
              description: style.evidence,
            }))}
          />
        </ParameterCard>

        <ParameterCard
          label="Dietary requirement"
          hint="Filters the shelf before scoring."
          provenance="data"
          evidence={
            selectedDietary
              ? `Only applied to ${selectedDietary.covered
                  .map((course) => COURSE_LABEL[course].toLowerCase())
                  .join(", ")} — the catalogue barely tags the other courses, so filtering them would empty the shelf.`
              : "The catalogue tags 44 products vegetarian, and almost no desserts or drinks."
          }
        >
          <ChoiceList
            name="Dietary requirement"
            value={parameters.dietary ?? NO_DIETARY}
            onChange={(id) =>
              onChange({ dietary: id === NO_DIETARY ? null : id })
            }
            choices={[
              { id: NO_DIETARY, label: "No requirement" },
              ...dietary.map((option) => ({
                id: option.id,
                label: option.label,
                meta: `${option.total} products`,
              })),
            ]}
          />
        </ParameterCard>
      </div>

      <div className="sticky bottom-0 -mx-5 border-t border-line bg-cream/90 px-5 py-4 backdrop-blur sm:-mx-8 sm:px-8 lg:-mx-12 lg:px-12">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-muted">
            One simulated shop, then scale it to thousands.
          </p>
          <ArrowButton
            label="Run the simulation"
            onClick={onRun}
            className="px-5 py-2.5"
          />
        </div>
      </div>
    </div>
  );
}
