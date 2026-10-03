"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import {
  FLOW_STEPS,
  STEP_LABEL,
  useMissionStep,
} from "@/components/mission/MissionStepContext";
import { ArrowButton } from "@/components/ui/ArrowButton";
import { cn } from "@/lib/utils";

export function Wordmark({ className }: { className?: string }) {
  return (
    // Inline size + filter: Tailwind's img preflight sets `height: auto`,
    // which otherwise lets the 819×359 PNG paint at full size and stay yellow.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/images/logo.png"
      alt="scroll2shelf"
      width={146}
      height={64}
      className={className}
      style={{
        display: "block",
        height: 48,
        width: "auto",
        maxHeight: 48,
        filter: "brightness(0)",
      }}
    />
  );
}

/**
 * The only chrome on the page. The run CTA stays pinned here so it is reachable
 * from anywhere in the overview without scrolling back up.
 */
export function TopBar() {
  const { step, stepIndex, goTo, advanceTo } = useMissionStep();

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-cream/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-[1280px] items-center justify-between gap-4 px-5 py-3 sm:px-8 lg:px-12">
        <button
          type="button"
          onClick={() => goTo("home")}
          className="flex flex-col items-start gap-0.5 text-left"
        >
          <Wordmark />
          <span className="text-[11px] tracking-wide text-muted">
            AI retail intelligence
          </span>
        </button>

        {step === "home" ? (
          <ArrowButton
            label="Run simulation"
            onClick={() => advanceTo("configure")}
          />
        ) : (
          <div className="flex items-center gap-3">
            <FlowProgress current={stepIndex} />
            <button
              type="button"
              onClick={() => goTo("home")}
              className="rounded-lg border border-line-strong px-3 py-2 text-sm font-medium text-plum transition-colors hover:bg-sand"
            >
              Overview
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

/** Configure → Simulate → Results, shown only once the flow has started. */
function FlowProgress({ current }: { current: number }) {
  const steps = FLOW_STEPS;

  return (
    <ol className="hidden items-center gap-1 rounded-lg border border-line bg-white p-1 md:flex">
      {steps.map((step) => {
        const index = FLOW_STEPS.indexOf(step);
        const isCurrent = index === current - 1;
        const isDone = index < current - 1;

        return (
          <li key={step}>
            <span
              className={cn(
                "relative flex items-center gap-2 rounded-md px-3 py-1.5 text-sm",
                isCurrent ? "text-plum" : "text-muted",
              )}
            >
              {isCurrent ? (
                <motion.span
                  layoutId="flow-progress"
                  className="absolute inset-0 rounded-md bg-popcorn-100"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              ) : null}
              <span
                className={cn(
                  "relative flex size-4 items-center justify-center rounded-full text-[10px] font-semibold",
                  isCurrent && "bg-plum text-popcorn",
                  isDone && "bg-plum/10 text-plum",
                  !isCurrent && !isDone && "bg-sand text-muted",
                )}
              >
                {isDone ? <Check className="size-2.5" strokeWidth={3} /> : index + 1}
              </span>
              <span className="relative font-medium">{STEP_LABEL[step]}</span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}
