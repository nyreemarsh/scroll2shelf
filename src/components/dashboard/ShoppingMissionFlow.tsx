import { Fragment } from "react";
import { ChevronRight } from "lucide-react";
import type { MissionStage } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ShoppingMissionFlow({ stages }: { stages: MissionStage[] }) {
  return (
    <div>
      <p className="eyebrow text-muted">AI-extracted shopping mission</p>
      <ol className="mt-4 flex items-stretch overflow-x-auto pb-1">
        {stages.map((stage, index) => (
          <Fragment key={stage.id}>
            <li className="min-w-[138px] flex-1">
              <div
                className={cn(
                  "h-full rounded-lg border px-4 py-3.5 transition-colors",
                  stage.highlight
                    ? "border-popcorn-200 bg-popcorn-50"
                    : "border-line bg-white hover:border-line-strong",
                )}
              >
                <span className="eyebrow text-muted/70">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="mt-2 text-sm font-semibold tracking-wide text-plum uppercase">
                  {stage.label}
                </p>
                <p className="mt-1 text-xs text-muted">{stage.caption}</p>
              </div>
            </li>
            {index < stages.length - 1 ? (
              <li
                aria-hidden
                className="flex shrink-0 items-center justify-center px-1.5 sm:px-2.5"
              >
                <ChevronRight className="size-4 text-muted/45" />
              </li>
            ) : null}
          </Fragment>
        ))}
      </ol>
    </div>
  );
}
