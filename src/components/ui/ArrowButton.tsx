import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type ArrowButtonTone = "solid" | "ghost" | "popcorn" | "onDark";

const toneStyles: Record<ArrowButtonTone, string> = {
  solid: "bg-plum text-cream hover:bg-plum-soft",
  ghost: "border border-line-strong text-plum hover:bg-sand",
  popcorn: "bg-popcorn text-plum hover:bg-popcorn-200",
  onDark: "bg-popcorn text-plum hover:bg-popcorn-200",
};

interface ArrowButtonProps {
  label: string;
  tone?: ArrowButtonTone;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}

export function ArrowButton({
  label,
  tone = "solid",
  className,
  onClick,
  disabled,
}: ArrowButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "group inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        toneStyles[tone],
        className,
      )}
    >
      {label}
      <ArrowRight
        className="size-4 transition-transform duration-300 group-hover:translate-x-1"
        strokeWidth={2}
      />
    </button>
  );
}

interface ArrowLinkProps {
  label: string;
  className?: string;
  onClick?: () => void;
}

export function ArrowLink({ label, className, onClick }: ArrowLinkProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group inline-flex items-center gap-1.5 text-sm font-medium text-plum transition-colors hover:text-plum-soft",
        className,
      )}
    >
      {label}
      <ArrowRight
        className="size-4 transition-transform duration-300 group-hover:translate-x-1"
        strokeWidth={2}
      />
    </button>
  );
}
