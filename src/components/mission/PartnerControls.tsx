"use client";

import { ChevronDown, Lock } from "lucide-react";
import type {
  HealthGoal,
  ShopperPreferences,
} from "@/lib/simulation/types";

interface PartnerControlsProps {
  label: string;
  preferences: ShopperPreferences;
  onChange: (patch: Partial<ShopperPreferences>) => void;
}

export function PartnerControls({
  label,
  preferences,
  onChange,
}: PartnerControlsProps) {
  return (
    <div className="overflow-hidden rounded-card border border-line bg-white">
      <div className="border-b border-line px-5 py-4">
        <p className="eyebrow text-muted">Editable preferences</p>
        <h3 className="mt-1 text-base font-semibold text-plum">{label}</h3>
        <p className="mt-1 text-xs text-muted">
          The persona supplies these starting values. Every active control feeds the product score.
        </p>
      </div>

      <PreferenceSection title="Money and value" open>
        <PreferenceSlider
          label="Price sensitivity"
          low="Spend for fit"
          high="Protect value"
          value={preferences.priceSensitivity}
          onChange={(priceSensitivity) => onChange({ priceSensitivity })}
        />
        <DisabledControl label="Response to promotions" />
      </PreferenceSection>

      <PreferenceSection title="Taste and appetite" open>
        <PreferenceSlider
          label="Treat appetite"
          low="Everyday"
          high="Indulgent"
          value={preferences.treatAppetite}
          onChange={(treatAppetite) => onChange({ treatAppetite })}
        />
        <PreferenceSlider
          label="Flavour preference"
          low="Mild"
          high="Bold"
          value={preferences.flavourBoldness}
          onChange={(flavourBoldness) => onChange({ flavourBoldness })}
        />
        <DisabledControl label="Hunger and portion size" />
      </PreferenceSection>

      <PreferenceSection title="Discovery and influence">
        <PreferenceSlider
          label="Product discovery"
          low="Familiar"
          high="New"
          value={preferences.noveltySeeking}
          onChange={(noveltySeeking) => onChange({ noveltySeeking })}
        />
        <PreferenceSlider
          label="TikTok influence"
          low="Ignore it"
          high="Recreate it"
          value={preferences.trendAffinity}
          onChange={(trendAffinity) => onChange({ trendAffinity })}
        />
        <DisabledControl label="Trust in unfamiliar brands" />
        <DisabledControl label="Reviews and other shoppers" />
      </PreferenceSection>

      <PreferenceSection title="Food goals and values">
        <PreferenceSlider
          label="Health priority"
          low="Low"
          high="High"
          value={preferences.healthOrientation}
          onChange={(healthOrientation) => onChange({ healthOrientation })}
        />
        <label className="block text-xs font-medium text-plum">
          Health goal
          <select
            value={preferences.healthGoal}
            onChange={(event) =>
              onChange({ healthGoal: event.target.value as HealthGoal })
            }
            className="mt-2 w-full rounded-lg border border-line-strong bg-white px-3 py-2 text-sm text-plum"
          >
            <option value="balanced">Balanced choice</option>
            <option value="protein">More protein</option>
            <option value="vegetables">More vegetables</option>
            <option value="less-sugar">Less sugar</option>
          </select>
        </label>
        <PreferenceSlider
          label="Sustainability priority"
          low="Low"
          high="High"
          value={preferences.sustainabilityPriority}
          onChange={(sustainabilityPriority) => onChange({ sustainabilityPriority })}
        />
        <PreferenceSlider
          label="Waste avoidance"
          low="Low"
          high="High"
          value={preferences.wasteAvoidance}
          onChange={(wasteAvoidance) => onChange({ wasteAvoidance })}
        />
      </PreferenceSection>

      <PreferenceSection title="Effort and information">
        <PreferenceSlider
          label="Desire for easy preparation"
          low="Happy to cook"
          high="Make it easy"
          value={preferences.easePreference}
          onChange={(easePreference) => onChange({ easePreference })}
        />
        <DisabledControl label="Cooking confidence" />
        <DisabledControl label="Image versus product details" />
      </PreferenceSection>

      <PreferenceSection title="Current state">
        <DisabledControl label="Mood and mood intensity" />
        <DisabledControl label="Unplanned extras" />
      </PreferenceSection>
    </div>
  );
}

function PreferenceSection({
  title,
  open,
  children,
}: {
  title: string;
  open?: boolean;
  children: React.ReactNode;
}) {
  return (
    <details className="group border-b border-line last:border-0" open={open}>
      <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-3.5 text-sm font-semibold text-plum">
        {title}
        <ChevronDown className="size-4 transition-transform group-open:rotate-180" />
      </summary>
      <div className="space-y-5 border-t border-line bg-cream/30 px-5 py-4">
        {children}
      </div>
    </details>
  );
}

function PreferenceSlider({
  label,
  low,
  high,
  value,
  onChange,
}: {
  label: string;
  low: string;
  high: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block">
      <span className="flex items-center justify-between text-xs font-medium text-plum">
        {label}
        <span className="font-semibold tabular-nums">{Math.round(value * 100)}</span>
      </span>
      <input
        type="range"
        min={0}
        max={1}
        step={0.05}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-2 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-sand accent-plum"
      />
      <span className="mt-1 flex justify-between text-[11px] text-muted">
        <span>{low}</span><span>{high}</span>
      </span>
    </label>
  );
}

function DisabledControl({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-dashed border-line bg-sand/35 px-3 py-2 text-xs text-muted opacity-60">
      <span>{label}</span>
      <span className="inline-flex items-center gap-1">
        <Lock className="size-3" /> Later
      </span>
    </div>
  );
}
