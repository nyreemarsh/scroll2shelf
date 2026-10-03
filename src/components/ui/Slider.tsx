"use client";

import { cn } from "@/lib/utils";

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  /** Rendered large above the track. */
  display: string;
  /** Captions pinned under each end of the track. */
  minLabel?: string;
  maxLabel?: string;
  className?: string;
}

export function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  display,
  minLabel,
  maxLabel,
  className,
}: SliderProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <p className="text-2xl font-semibold tracking-tight text-plum tabular-nums">
        {display}
      </p>
      <input
        type="range"
        aria-label={label}
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-sand accent-plum"
      />
      {minLabel || maxLabel ? (
        <div className="flex justify-between text-xs text-muted">
          <span>{minLabel}</span>
          <span>{maxLabel}</span>
        </div>
      ) : null}
    </div>
  );
}
