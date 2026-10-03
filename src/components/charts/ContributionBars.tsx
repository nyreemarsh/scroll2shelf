"use client";

import { motion } from "framer-motion";
import type { ModelContribution } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ContributionBars({
  contributions,
}: {
  contributions: ModelContribution[];
}) {
  const max = Math.max(...contributions.map((item) => item.weight));

  return (
    <ul className="space-y-3.5">
      {contributions.map((item, index) => (
        <li
          key={item.id}
          className="grid grid-cols-[118px_minmax(0,1fr)_46px] items-center gap-3 sm:grid-cols-[172px_minmax(0,1fr)_52px] sm:gap-4"
        >
          <span className="text-sm text-plum">{item.label}</span>
          <div className="h-2.5 w-full overflow-hidden rounded-xs border border-line bg-cream">
            <motion.div
              className={cn(
                "h-full",
                index === 0
                  ? "bg-popcorn ring-1 ring-line-strong ring-inset"
                  : "bg-cerulean",
              )}
              initial={{ width: 0 }}
              whileInView={{ width: `${(item.weight / max) * 100}%` }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                duration: 0.85,
                delay: index * 0.07,
                ease: [0.22, 1, 0.36, 1],
              }}
            />
          </div>
          <span className="text-right text-sm font-medium text-plum tabular-nums">
            +{item.weight.toFixed(2)}
          </span>
        </li>
      ))}
    </ul>
  );
}
