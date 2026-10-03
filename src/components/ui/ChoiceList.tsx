"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Choice {
  id: string;
  label: string;
  description?: string;
  /** Right-aligned supporting figure, usually the evidence behind the option. */
  meta?: string;
}

interface ChoiceListProps {
  name: string;
  choices: Choice[];
  value: string;
  onChange: (id: string) => void;
  className?: string;
}

/** A radio group styled as selectable rows, used for every preset parameter. */
export function ChoiceList({
  name,
  choices,
  value,
  onChange,
  className,
}: ChoiceListProps) {
  return (
    <div role="radiogroup" aria-label={name} className={cn("space-y-1.5", className)}>
      {choices.map((choice) => {
        const selected = choice.id === value;

        return (
          <button
            key={choice.id}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(choice.id)}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors",
              selected
                ? "border-popcorn-200 bg-popcorn-100"
                : "border-line bg-white hover:border-line-strong",
            )}
          >
            <span
              className={cn(
                "flex size-4 shrink-0 items-center justify-center rounded-full border transition-colors",
                selected ? "border-plum bg-plum" : "border-line-strong",
              )}
            >
              {selected ? (
                <Check className="size-2.5 text-popcorn" strokeWidth={3.5} />
              ) : null}
            </span>

            <span className="min-w-0 flex-1">
              <span className="block text-sm leading-snug font-medium text-plum">
                {choice.label}
              </span>
              {choice.description ? (
                <span className="mt-0.5 block text-xs text-muted">
                  {choice.description}
                </span>
              ) : null}
            </span>

            {choice.meta ? (
              <span className="shrink-0 text-xs text-muted tabular-nums">
                {choice.meta}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
