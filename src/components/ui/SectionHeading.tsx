import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "mb-6 flex flex-wrap items-end justify-between gap-4",
        className,
      )}
    >
      <div>
        <p className="eyebrow text-muted">{eyebrow}</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-plum lg:text-[1.75rem]">
          {title}
        </h2>
        {description ? (
          <p className="mt-2 max-w-xl text-sm text-muted">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}
