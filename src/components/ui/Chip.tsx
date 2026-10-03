import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type ChipTone = "neutral" | "popcorn" | "cerulean" | "plum" | "onDark";

const toneStyles: Record<ChipTone, string> = {
  neutral: "border-line bg-white text-muted",
  popcorn: "border-popcorn-200 bg-popcorn-100 text-plum",
  cerulean: "border-cerulean-200 bg-cerulean-50 text-plum",
  plum: "border-transparent bg-plum text-popcorn",
  onDark: "border-white/15 bg-white/5 text-cream/80",
};

interface ChipProps {
  children: ReactNode;
  tone?: ChipTone;
  className?: string;
}

export function Chip({ children, tone = "neutral", className }: ChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium",
        toneStyles[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
