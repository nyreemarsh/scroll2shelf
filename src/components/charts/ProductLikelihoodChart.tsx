"use client";

import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import type { LikelihoodEmphasis, ProductLikelihood } from "@/lib/types";
import { chartPalette } from "./palette";

const fills: Record<LikelihoodEmphasis, string> = {
  highlight: chartPalette.popcorn,
  primary: chartPalette.plum,
  secondary: chartPalette.cerulean,
  muted: chartPalette.ceruleanSoft,
};

export function ProductLikelihoodChart({
  data,
}: {
  data: ProductLikelihood[];
}) {
  const rows = data.map((item) => ({
    ...item,
    display: `${item.probability}%`,
  }));
  const max = Math.max(...data.map((item) => item.probability));

  return (
    <div className="h-[286px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={rows}
          layout="vertical"
          margin={{ top: 4, right: 46, bottom: 4, left: 0 }}
          barCategoryGap={14}
        >
          <XAxis type="number" hide domain={[0, max + 6]} />
          <YAxis
            type="category"
            dataKey="chartLabel"
            width={176}
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12, fill: chartPalette.plum, width: 160 }}
          />
          <Bar dataKey="probability" radius={[0, 4, 4, 0]} animationDuration={950}>
            {rows.map((row) => (
              <Cell
                key={row.id}
                fill={fills[row.emphasis]}
                stroke={
                  row.emphasis === "highlight" ? chartPalette.stroke : undefined
                }
              />
            ))}
            <LabelList
              dataKey="display"
              position="right"
              fill={chartPalette.plum}
              fontSize={12}
              fontWeight={600}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
