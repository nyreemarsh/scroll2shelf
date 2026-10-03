import type { ReactNode } from "react";
import { Database, SlidersHorizontal } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

interface ParameterCardProps {
  label: string;
  hint?: string;
  /** What the setting is grounded in, shown verbatim in the footer. */
  evidence: string;
  /** Measured from the TikTok sample or catalogue, versus a dial we set. */
  provenance: "data" | "assumption";
  children: ReactNode;
  className?: string;
}

/**
 * Every control carries its own provenance line. The distinction mirrors
 * `MODEL_CONFIG`: measured figures and hand-set dials never look alike.
 */
export function ParameterCard({
  label,
  hint,
  evidence,
  provenance,
  children,
  className,
}: ParameterCardProps) {
  const Icon = provenance === "data" ? Database : SlidersHorizontal;

  return (
    <Card className={cn("flex flex-col p-5", className)}>
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-plum">{label}</h3>
        {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
      </div>

      <div className="flex-1">{children}</div>

      <div className="mt-5 flex items-start gap-2 border-t border-line pt-3.5">
        <Icon
          className={cn(
            "mt-px size-3.5 shrink-0",
            provenance === "data" ? "text-cerulean" : "text-muted",
          )}
          strokeWidth={2}
        />
        <p className="text-xs leading-relaxed text-muted">
          <span
            className={cn(
              "font-semibold",
              provenance === "data" ? "text-plum" : "text-muted",
            )}
          >
            {provenance === "data" ? "Measured" : "Assumption"}
          </span>{" "}
          · {evidence}
        </p>
      </div>
    </Card>
  );
}
