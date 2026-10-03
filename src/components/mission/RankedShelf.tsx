"use client";

import Image from "next/image";
import type { Course } from "@/lib/catalogue";
import { COURSE_LABEL } from "@/lib/simulation/courses";
import type { SimulationSummary } from "@/lib/simulation/types";
import { Card } from "@/components/ui/Card";
import { formatPrice } from "@/lib/utils";

/** Products per course on the ranking. */
const RANK_SIZE = 3;

interface RankedShelfProps {
  summary: SimulationSummary;
  courses: Course[];
}

/**
 * The deliverable for a retailer: across every simulated night, which product
 * won each course most often.
 */
export function RankedShelf({ summary, courses }: RankedShelfProps) {
  const populated = courses.filter(
    (course) => (summary.topByCourse[course] ?? []).length > 0,
  );

  return (
    <div className="space-y-5">
      {populated.map((course) => {
        const ranked = summary.topByCourse[course].slice(0, RANK_SIZE);
        const attach = summary.attachRates[course] ?? 0;

        return (
          <Card key={course} className="p-5">
            <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="text-sm font-semibold text-plum">
                {COURSE_LABEL[course]}
              </h3>
              <p className="text-xs text-muted">
                bought on{" "}
                <span className="font-medium text-plum tabular-nums">
                  {Math.round(attach * 100)}%
                </span>{" "}
                of simulated nights
              </p>
            </div>

            <ol className="grid gap-3 sm:grid-cols-3">
              {ranked.map((entry, position) => (
                <li
                  key={entry.product.id}
                  className="flex items-center gap-3 rounded-lg border border-line p-2.5"
                >
                  <span className="relative size-14 shrink-0 overflow-hidden rounded-md bg-sand">
                    <Image
                      src={entry.product.image}
                      alt=""
                      fill
                      sizes="56px"
                      className="object-contain p-0.5"
                    />
                    {position === 0 ? (
                      <span className="absolute top-0 left-0 bg-popcorn px-1.5 py-0.5 text-[10px] font-bold text-plum">
                        1
                      </span>
                    ) : null}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-medium text-plum">
                      {entry.product.name}
                    </span>
                    <span className="mt-1 block text-xs text-muted tabular-nums">
                      {formatPrice(entry.product.price)} ·{" "}
                      {(entry.share * 100).toFixed(1)}% of nights
                    </span>
                    <span className="mt-1.5 block h-1 overflow-hidden rounded-full bg-plum/10">
                      <span
                        className="block h-full rounded-full bg-cerulean"
                        style={{
                          width: `${Math.min(entry.share * 100, 100)}%`,
                        }}
                      />
                    </span>
                  </span>
                </li>
              ))}
            </ol>
          </Card>
        );
      })}
    </div>
  );
}
