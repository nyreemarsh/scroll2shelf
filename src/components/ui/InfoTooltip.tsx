import { Info } from "lucide-react";

export function InfoTooltip({ text }: { text: string }) {
  return (
    <span className="group relative inline-flex">
      <button
        type="button"
        aria-label="How this is calculated"
        className="text-muted transition-colors hover:text-plum focus-visible:text-plum focus-visible:outline-none"
      >
        <Info className="size-4" strokeWidth={1.9} />
      </button>
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 w-64 -translate-x-1/2 rounded-lg bg-plum px-3.5 py-3 text-xs leading-relaxed text-cream/85 opacity-0 transition-opacity duration-200 group-focus-within:opacity-100 group-hover:opacity-100"
      >
        {text}
      </span>
    </span>
  );
}
