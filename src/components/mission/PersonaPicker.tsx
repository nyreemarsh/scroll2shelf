"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef } from "react";
import { personas } from "@/data/personas";
import type { Persona } from "@/lib/simulation/types";
import { formatPrice } from "@/lib/utils";

const TRAITS: { label: string; of: (persona: Persona) => number }[] = [
  { label: "Discovery", of: (persona) => persona.noveltySeeking },
  { label: "Treat appetite", of: (persona) => persona.treatAppetite },
  { label: "Price sensitivity", of: (persona) => persona.priceSensitivity },
];

// Keep the choice focused: these eight cover the distinct shopping behaviours
// shown in the scenario, while the full persona data set remains available to
// the simulation and its existing saved runs.
const PERSONA_OPTIONS = [
  "trend-recreator",
  "familiar-favourite",
  "deal-detective",
  "treat-seeker",
  "curious-taster",
  "plan-keeper",
  "tired-shortcut-seeker",
  "careful-label-reader",
];

const pickerPersonas = PERSONA_OPTIONS.map((id) =>
  personas.find((persona) => persona.id === id),
).filter((persona): persona is Persona => persona !== undefined);

interface PersonaPickerProps {
  slot: string;
  value: string;
  onChange: (id: string) => void;
  enabledIds?: string[];
}

export function PersonaPicker({
  slot,
  value,
  onChange,
  enabledIds,
}: PersonaPickerProps) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const selectedCardRef = useRef<HTMLButtonElement>(null);
  const selected = pickerPersonas.find((persona) => persona.id === value) ?? pickerPersonas[0];
  const enabled = enabledIds ? new Set(enabledIds) : null;

  useEffect(() => {
    selectedCardRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [selected.id]);

  const scrollCarousel = (direction: "back" | "forward") => {
    carouselRef.current?.scrollBy({
      left: direction === "forward" ? 248 : -248,
      behavior: "smooth",
    });
  };

  return (
    <div>
      <p className="eyebrow mb-2.5 block text-muted">
        {slot}
      </p>

      <div className="relative">
        <div
          ref={carouselRef}
          className="-mx-1 flex snap-x gap-2 overflow-x-auto px-1 pb-2 pt-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-label={`${slot} persona options`}
        >
          {pickerPersonas.map((persona) => {
            const isSelected = persona.id === selected.id;
            const isEnabled = !enabled || enabled.has(persona.id);

            return (
              <button
                key={persona.id}
                ref={isSelected ? selectedCardRef : undefined}
                type="button"
                onClick={() => onChange(persona.id)}
                disabled={!isEnabled}
                aria-pressed={isSelected}
                className={`w-48 shrink-0 snap-start rounded-lg border bg-white p-3 text-left transition focus:outline-none focus:ring-2 focus:ring-cerulean/25 disabled:cursor-not-allowed disabled:opacity-40 ${
                  isSelected
                    ? "border-cerulean ring-2 ring-cerulean/25"
                    : "border-line hover:border-cerulean/60"
                }`}
              >
                <span className="block text-sm font-semibold leading-snug text-plum">
                  {persona.name}
                </span>
                <span className="mt-1.5 block line-clamp-2 text-xs leading-relaxed text-muted">
                  {isEnabled ? persona.tagline : "Not available with this partner"}
                </span>
              </button>
            );
          })}
        </div>
        <div className="mt-1 flex justify-end gap-1.5">
          <button
            type="button"
            onClick={() => scrollCarousel("back")}
            aria-label={`Previous ${slot} personas`}
            className="rounded-md border border-line p-1 text-muted transition hover:border-cerulean hover:text-cerulean focus:outline-none focus:ring-2 focus:ring-cerulean/25"
          >
            <ChevronLeft className="size-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => scrollCarousel("forward")}
            aria-label={`Next ${slot} personas`}
            className="rounded-md border border-line p-1 text-muted transition hover:border-cerulean hover:text-cerulean focus:outline-none focus:ring-2 focus:ring-cerulean/25"
          >
            <ChevronRight className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="mt-4 rounded-lg bg-sand/60 p-4">
        <p className="text-xs leading-relaxed text-muted">{selected.tagline}</p>
        <dl className="mt-3.5 space-y-2.5">
          {TRAITS.map((trait) => {
            const level = trait.of(selected);
            return (
              <div key={trait.label} className="flex items-center gap-3">
                <dt className="w-28 shrink-0 text-xs text-muted">{trait.label}</dt>
                <dd className="flex flex-1 items-center gap-2.5">
                  <span className="h-1 flex-1 overflow-hidden rounded-full bg-plum/10">
                    <span
                      className="block h-full rounded-full bg-cerulean"
                      style={{ width: `${Math.round(level * 100)}%` }}
                    />
                  </span>
                  <span className="w-7 text-right text-xs text-plum tabular-nums">
                    {Math.round(level * 100)}
                  </span>
                </dd>
              </div>
            );
          })}
        </dl>
        <p className="mt-3.5 border-t border-line pt-3 text-xs text-muted">
          Typical date-night budget: <span className="font-medium text-plum">{formatPrice(selected.budget)}</span>
        </p>
      </div>
    </div>
  );
}
