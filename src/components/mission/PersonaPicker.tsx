"use client";

import { personas } from "@/data/personas";
import { ChoiceList } from "@/components/ui/ChoiceList";
import type { Persona } from "@/lib/simulation/types";
import { formatPrice } from "@/lib/utils";

/** The three traits that separate the four archetypes most clearly. */
const TRAITS: { label: string; of: (persona: Persona) => number }[] = [
  { label: "Trend affinity", of: (p) => p.trendAffinity },
  { label: "Indulgence", of: (p) => p.indulgence },
  { label: "Price sensitivity", of: (p) => p.priceSensitivity },
];

interface PersonaPickerProps {
  slot: string;
  value: string;
  onChange: (id: string) => void;
}

export function PersonaPicker({ slot, value, onChange }: PersonaPickerProps) {
  const selected = personas.find((persona) => persona.id === value) ?? personas[0];

  return (
    <div>
      <p className="eyebrow mb-2.5 text-muted">{slot}</p>

      <ChoiceList
        name={slot}
        value={value}
        onChange={onChange}
        choices={personas.map((persona) => ({
          id: persona.id,
          label: persona.name,
        }))}
      />

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
                  <span className="w-7 shrink-0 text-right text-xs text-plum tabular-nums">
                    {Math.round(level * 100)}
                  </span>
                </dd>
              </div>
            );
          })}
        </dl>

        <p className="mt-3.5 border-t border-line pt-3 text-xs text-muted">
          Typically spends{" "}
          <span className="font-medium text-plum">
            {formatPrice(selected.budget)}
          </span>{" "}
          on a night like this
        </p>
      </div>
    </div>
  );
}
