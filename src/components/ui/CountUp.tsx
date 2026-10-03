"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import type { StatValue } from "@/lib/types";

interface CountUpProps extends StatValue {
  duration?: number;
  className?: string;
}

const easeOut = (t: number): number => 1 - Math.pow(1 - t, 3);

/**
 * Thousands separators without `Intl`, which disagrees between Node and the
 * browser often enough to cause hydration mismatches.
 */
function group(value: string): string {
  const [whole, fraction] = value.split(".");
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return fraction ? `${grouped}.${fraction}` : grouped;
}

export function CountUp({
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
  duration = 1100,
  className,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const reduceMotion = useReducedMotion();
  const [animated, setAnimated] = useState(0);

  const shouldAnimate = inView && !reduceMotion;
  const display = reduceMotion ? value : animated;

  useEffect(() => {
    if (!shouldAnimate) return;

    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      setAnimated(value * easeOut(progress));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [shouldAnimate, value, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {group(display.toFixed(decimals))}
      {suffix}
    </span>
  );
}
