"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { MomentumPoint } from "@/lib/types";
import { chartPalette } from "./palette";

export function TrendMomentumChart({ data }: { data: MomentumPoint[] }) {
  return (
    <div className="h-[152px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 6, bottom: 0, left: 0 }}>
          <CartesianGrid vertical={false} stroke={chartPalette.line} />
          <XAxis
            dataKey="day"
            tickLine={false}
            axisLine={false}
            dy={8}
            tick={{ fontSize: 11, fill: chartPalette.muted }}
          />
          <YAxis hide domain={[0, 112]} />
          <Tooltip
            cursor={{ stroke: chartPalette.cerulean, strokeDasharray: "4 4" }}
            contentStyle={{
              borderRadius: 10,
              border: `1px solid ${chartPalette.line}`,
              fontSize: 12,
              padding: "8px 10px",
              boxShadow: "none",
            }}
            labelStyle={{ color: chartPalette.muted, marginBottom: 2 }}
            itemStyle={{ color: chartPalette.plum }}
          />
          <Area
            name="Momentum index"
            type="monotone"
            dataKey="value"
            stroke={chartPalette.cerulean}
            strokeWidth={2.5}
            fill={chartPalette.cerulean}
            fillOpacity={0.18}
            dot={false}
            activeDot={{
              r: 4,
              fill: chartPalette.plum,
              stroke: "#ffffff",
              strokeWidth: 2,
            }}
            animationDuration={1200}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
