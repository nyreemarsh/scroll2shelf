"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import type { TimeRange } from "@/lib/types";
import { cn } from "@/lib/utils";

export function RangeSelect({ ranges }: { ranges: TimeRange[] }) {
  const [selected, setSelected] = useState(ranges[0]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="inline-flex items-center gap-2 rounded-lg border border-line-strong bg-white px-3.5 py-2 text-sm font-medium text-plum transition-colors hover:bg-sand"
      >
        {selected.label}
        <ChevronDown
          className={cn(
            "size-4 text-muted transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>

      {open ? (
        <div className="absolute right-0 z-20 mt-1.5 w-44 overflow-hidden rounded-lg border border-line bg-white py-1 shadow-sm">
          {ranges.map((range) => (
            <button
              key={range.id}
              type="button"
              onClick={() => {
                setSelected(range);
                setOpen(false);
              }}
              className={cn(
                "block w-full px-3.5 py-2 text-left text-sm transition-colors hover:bg-sand",
                range.id === selected.id
                  ? "bg-popcorn-50 font-medium text-plum"
                  : "text-muted",
              )}
            >
              {range.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
