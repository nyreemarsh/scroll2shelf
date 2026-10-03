"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import {
  compatiblePartnerIds,
  preferencesFor,
} from "@/data/personas";
import {
  BUDGET_RANGE,
  type SimulationParameters,
} from "@/lib/simulation/parameters";
import type { ShopperPreferences } from "@/lib/simulation/types";
import { formatBudget } from "@/lib/utils";
import { ArrowButton } from "@/components/ui/ArrowButton";
import { Card } from "@/components/ui/Card";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Slider } from "@/components/ui/Slider";
import { ParameterCard } from "./ParameterCard";
import { PartnerControls } from "./PartnerControls";
import { PersonaPicker } from "./PersonaPicker";
import { useMissionStep } from "./MissionStepContext";

interface ConfigureStepProps {
  parameters: SimulationParameters;
  onChange: (patch: Partial<SimulationParameters>) => void;
  onRun: () => void;
}

const SETUP_SECTIONS = [
  {
    label: "Shoppers",
    title: "Choose your shoppers",
    description: "Pick the two personas taking part in this simulated shop.",
  },
  {
    label: "Preferences",
    title: "Tune their preferences",
    description: "Adjust how each selected persona weighs flavour, value, health and convenience.",
  },
  {
    label: "Dynamics",
    title: "Set the couple dynamics",
    description: "Control how the partners compromise, share and manage their budget after each fair round.",
  },
] as const;

export function ConfigureStep({ parameters, onChange, onRun }: ConfigureStepProps) {
  const [activeSection, setActiveSection] = useState(0);
  const { goTo } = useMissionStep();
  const compatible = compatiblePartnerIds(parameters.shopperA);
  const overlap = preferenceOverlap(parameters.preferencesA, parameters.preferencesB);
  const section = SETUP_SECTIONS[activeSection];
  const isLastSection = activeSection === SETUP_SECTIONS.length - 1;

  const chooseA = (shopperA: string) => {
    const nextCompatible = compatiblePartnerIds(shopperA);
    const keepsB = nextCompatible.includes(parameters.shopperB);
    const shopperB = keepsB ? parameters.shopperB : nextCompatible[0];
    onChange({
      shopperA,
      preferencesA: preferencesFor(shopperA),
      shopperB,
      preferencesB: keepsB ? parameters.preferencesB : preferencesFor(shopperB),
    });
  };

  const chooseB = (shopperB: string) =>
    onChange({ shopperB, preferencesB: preferencesFor(shopperB) });

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow={`Set up · ${activeSection + 1} of ${SETUP_SECTIONS.length}`}
        title={section.title}
        description={section.description}
      />

      <nav aria-label="Simulation setup progress" className="overflow-x-auto pb-1">
        <ol className="flex min-w-max items-center gap-2">
          {SETUP_SECTIONS.map((item, index) => {
            const isCurrent = index === activeSection;
            const isComplete = index < activeSection;
            return (
              <li key={item.label} className="flex items-center gap-2">
                {index > 0 ? <span aria-hidden className="h-px w-5 bg-line-strong" /> : null}
                <button
                  type="button"
                  onClick={() => setActiveSection(index)}
                  aria-current={isCurrent ? "step" : undefined}
                  className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                    isCurrent
                      ? "border-plum bg-plum text-cream"
                      : isComplete
                        ? "border-cerulean-200 bg-cerulean-50 text-plum"
                        : "border-line bg-white text-muted hover:border-line-strong hover:text-plum"
                  }`}
                >
                  <span className={`flex size-5 items-center justify-center rounded-full text-[10px] ${
                    isCurrent ? "bg-cream/15" : "bg-sand"
                  }`}>
                    {index + 1}
                  </span>
                  {item.label}
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      {activeSection === 0 ? <Card className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-plum">Who is shopping?</h3>
            <p className="mt-1 text-xs text-muted">
              Browse eight shopper personas. Select a card to see their shopping profile; unavailable Partner B pairings are muted.
            </p>
          </div>
          <span className="rounded-full bg-cerulean/10 px-3 py-1 text-xs font-medium text-cerulean">
            8 personas to explore
          </span>
        </div>
        <div className="mt-5 grid gap-8 md:grid-cols-2">
          <PersonaPicker slot="Partner A" value={parameters.shopperA} onChange={chooseA} />
          <PersonaPicker
            slot="Partner B"
            value={parameters.shopperB}
            onChange={chooseB}
            enabledIds={compatible}
          />
        </div>
      </Card> : null}

      {activeSection === 1 ? <div className="grid gap-5 xl:grid-cols-2">
        <PartnerControls
          label="Partner A"
          preferences={parameters.preferencesA}
          onChange={(patch) =>
            onChange({ preferencesA: { ...parameters.preferencesA, ...patch } })
          }
        />
        <PartnerControls
          label="Partner B"
          preferences={parameters.preferencesB}
          onChange={(patch) =>
            onChange({ preferencesB: { ...parameters.preferencesB, ...patch } })
          }
        />
      </div> : null}

      {activeSection === 2 ? <section>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <ParameterCard
            label="Taste overlap"
            hint="Calculated from both partners’ edited preferences."
            provenance="data"
            evidence="Descriptive only—it does not overwrite either partner’s choices."
          >
            <div className="space-y-3">
              <p className="text-2xl font-semibold text-plum">{Math.round(overlap * 100)}%</p>
              <div className="h-1.5 overflow-hidden rounded-full bg-sand">
                <div className="h-full rounded-full bg-cerulean" style={{ width: `${overlap * 100}%` }} />
              </div>
              <div className="flex justify-between text-xs text-muted"><span>Different</span><span>Similar</span></div>
            </div>
          </ParameterCard>

          <CoupleSlider
            label="Willingness to compromise"
            hint="How much the losing partner still shapes the pick."
            value={parameters.compromise}
            low="Own preference"
            high="Meet halfway"
            onChange={(compromise) => onChange({ compromise })}
          />
          <CoupleSlider
            label="Winner’s control"
            hint="How much authority winning creates before compromise."
            value={parameters.winnerControl}
            low="Discuss it"
            high="Winner decides"
            onChange={(winnerControl) => onChange({ winnerControl })}
          />
          <CoupleSlider
            label="Budget flexibility"
            hint="Overspending is allowed, but still carries a penalty."
            value={parameters.budgetFlexibility}
            low="Protect limit"
            high="Stretch for fit"
            onChange={(budgetFlexibility) => onChange({ budgetFlexibility })}
          />
          <CoupleSlider
            label="Sharing preference"
            hint="Raises products designed to work for two."
            value={parameters.sharingPreference}
            low="Separate items"
            high="Share together"
            onChange={(sharingPreference) => onChange({ sharingPreference })}
          />
          <ParameterCard
            label="Budget for the night"
            hint="A soft target across every course."
            provenance="assumption"
            evidence="The model reports overspend instead of blocking a plausible choice."
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
        </div>
      </section> : null}

      <div className="sticky bottom-0 z-20 -mx-5 border-t border-line bg-cream/95 px-5 py-4 shadow-[0_-8px_24px_rgba(63,43,43,0.04)] backdrop-blur sm:-mx-8 sm:px-8 lg:-mx-12 lg:px-12">
        <div className="grid gap-3 sm:flex sm:items-center sm:justify-between sm:gap-4">
          <div className="min-w-0">
            <p className="text-sm font-medium text-plum">{section.label}</p>
            <p className="text-xs text-muted">Saved automatically in this browser.</p>
          </div>
          <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:items-center">
            <button
              type="button"
              onClick={() => {
                if (activeSection === 0) {
                  goTo("home");
                  return;
                }
                setActiveSection((current) => Math.max(0, current - 1));
              }}
              className="inline-flex min-w-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-line-strong px-3 py-2.5 text-sm font-medium text-plum transition hover:bg-sand sm:px-4"
            >
              <ArrowLeft className="size-4 shrink-0" />
              <span className="sm:hidden">Back</span>
              <span className="hidden sm:inline">
                {activeSection === 0 ? "Back to overview" : "Back"}
              </span>
            </button>
            <ArrowButton
              label={isLastSection ? "Run simulation" : `Next: ${SETUP_SECTIONS[activeSection + 1].label}`}
              onClick={isLastSection ? onRun : () => setActiveSection((current) => Math.min(SETUP_SECTIONS.length - 1, current + 1))}
              className="min-w-0 justify-center whitespace-nowrap px-3 py-2.5 [&_svg]:hidden sm:px-5 sm:[&_svg]:block"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function preferenceOverlap(a: ShopperPreferences, b: ShopperPreferences): number {
  const values: (keyof ShopperPreferences)[] = [
    "priceSensitivity", "treatAppetite", "flavourBoldness", "noveltySeeking",
    "trendAffinity", "healthOrientation", "easePreference",
    "sustainabilityPriority", "wasteAvoidance",
  ];
  const distance = values.reduce((sum, key) => sum + Math.abs(Number(a[key]) - Number(b[key])), 0);
  return Math.max(0, 1 - distance / values.length);
}

function CoupleSlider(props: {
  label: string; hint: string; value: number; low: string; high: string;
  onChange: (value: number) => void;
}) {
  return (
    <ParameterCard label={props.label} hint={props.hint} provenance="assumption" evidence="Applied after the fair RPS result; it cannot change who wins.">
      <Slider label={props.label} value={props.value} min={0} max={1} step={0.05} onChange={props.onChange}
        display={`${Math.round(props.value * 100)}%`} minLabel={props.low} maxLabel={props.high} />
    </ParameterCard>
  );
}
