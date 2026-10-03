"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import type { Candidate } from "@/lib/simulation/types";
import { cn, formatPrice } from "@/lib/utils";

interface ProductCardProps {
  candidate: Candidate;
  /** Null until the round resolves, so nothing is dimmed prematurely. */
  chosen: boolean | null;
  /** Shared-layout id so the chosen card can fly into the basket. */
  layoutId?: string;
}

export function ProductCard({ candidate, chosen, layoutId }: ProductCardProps) {
  const { product, probability, reasons } = candidate;
  const decided = chosen !== null;
  const isChosen = chosen === true;

  return (
    <motion.article
      layoutId={layoutId}
      animate={{ opacity: decided && !isChosen ? 0.45 : 1 }}
      transition={{ duration: 0.35 }}
      className={cn(
        "flex flex-col overflow-hidden rounded-card border bg-white transition-colors",
        isChosen
          ? "border-popcorn-200 ring-2 ring-popcorn"
          : "border-line",
      )}
    >
      <div className="relative aspect-4/3 bg-sand">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, 240px"
          className="object-cover"
        />
        {isChosen ? (
          <span className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-md bg-plum px-2 py-1 text-[11px] font-semibold text-popcorn">
            <Check className="size-3" strokeWidth={3} />
            In the basket
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-3.5">
        <h4 className="text-sm leading-snug font-medium text-plum">
          {product.name}
        </h4>

        {reasons[0] ? (
          <p className="mt-1.5 text-xs text-muted">{reasons[0].label}</p>
        ) : null}

        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          <span className="text-base font-semibold text-plum tabular-nums">
            {formatPrice(product.price)}
          </span>
          <span className="text-xs text-muted tabular-nums">
            {(probability * 100).toFixed(0)}% likely
          </span>
        </div>
      </div>
    </motion.article>
  );
}
