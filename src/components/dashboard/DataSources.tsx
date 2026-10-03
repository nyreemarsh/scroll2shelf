import {
  Package,
  Repeat,
  Route,
  Share2,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { DataSignal, SignalIcon } from "@/lib/types";

const icons: Record<SignalIcon, LucideIcon> = {
  social: Share2,
  catalogue: Package,
  research: Users,
  mission: Route,
  simulation: Repeat,
};

export function DataSources({ signals }: { signals: DataSignal[] }) {
  return (
    <section className="border-t border-line pt-7">
      <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
        <p className="eyebrow text-muted">Signals powering this analysis</p>
        <ul className="flex flex-wrap gap-2">
          {signals.map((signal) => {
            const Icon = icons[signal.icon];
            return (
              <li key={signal.id}>
                <span className="inline-flex items-center gap-2 rounded-md border border-line bg-white px-3 py-1.5 text-xs text-muted">
                  <Icon className="size-3.5 text-cerulean" strokeWidth={2} />
                  {signal.label}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
