import { cn } from "@/lib/utils";

interface DotPatternProps {
  className?: string;
  size?: number;
}

/** Abstract texture used behind dark media placeholders. */
export function DotPattern({ className, size = 14 }: DotPatternProps) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0", className)}
      style={{
        backgroundImage:
          "radial-gradient(var(--color-popcorn) 1px, transparent 1px)",
        backgroundSize: `${size}px ${size}px`,
      }}
    />
  );
}
