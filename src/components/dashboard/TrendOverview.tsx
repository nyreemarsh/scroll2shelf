import { Sparkles } from "lucide-react";
import type { DetectedTrend } from "@/lib/types";
import { TrendMomentumChart } from "@/components/charts/TrendMomentumChart";
import { ShoppingMissionFlow } from "@/components/dashboard/ShoppingMissionFlow";
import { ArrowLink } from "@/components/ui/ArrowButton";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { formatCompactNumber } from "@/lib/utils";

export function TrendOverview({ trend }: { trend: DetectedTrend }) {
  const stats = [
    { id: "velocity", value: `+${trend.velocity}%`, label: "trend velocity" },
    {
      id: "views",
      value: formatCompactNumber(trend.views ?? 0),
      label: "social views",
    },
    { id: "sentiment", value: `${trend.sentiment}%`, label: "positive sentiment" },
    {
      id: "relevance",
      value: trend.retailRelevance ?? "—",
      label: "retail relevance",
    },
  ];

  return (
    <Card className="overflow-hidden">
      <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-10">
        <div className="flex flex-col">
          <div className="relative aspect-[9/16] max-h-[380px] overflow-hidden rounded-lg bg-plum">
            <video
              className="absolute inset-0 h-full w-full object-cover"
              src="/videos/1.mp4"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
            />
            <span className="eyebrow absolute top-4 left-4 rounded-full bg-plum/70 px-2.5 py-1 text-cream/90">
              Trend clip
            </span>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-muted">
            Clip 1 from the hand-coded TikTok sample. Sound is off so it can
            play on the page.
          </p>
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Chip tone="cerulean">Primary detected trend</Chip>
            <Chip>UK · Food &amp; Drink</Chip>
          </div>

          <h3 className="mt-4 text-2xl font-semibold tracking-tight text-plum lg:text-[1.75rem]">
            {trend.name}
          </h3>

          <div className="mt-5 rounded-lg border border-cerulean-100 bg-cerulean-50 p-4">
            <p className="eyebrow flex items-center gap-1.5 text-plum/65">
              <Sparkles className="size-3" strokeWidth={2.2} />
              AI summary
            </p>
            <p className="mt-2 text-sm leading-relaxed text-plum">
              {trend.summary}
            </p>
          </div>

          <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.id}>
                <dd className="text-xl font-semibold tracking-tight text-plum lg:text-2xl">
                  {stat.value}
                </dd>
                <dt className="mt-1 text-xs text-muted">{stat.label}</dt>
              </div>
            ))}
          </dl>

          <div className="mt-7">
            <div className="flex items-center justify-between">
              <p className="eyebrow text-muted">Social momentum</p>
              <span className="text-xs text-muted">Last 7 days</span>
            </div>
            <div className="mt-2">
              <TrendMomentumChart data={trend.momentum} />
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-line bg-cream/60 p-6 sm:p-8">
        <ShoppingMissionFlow stages={trend.mission} />
        <div className="mt-6 flex justify-end">
          <ArrowLink label="Open trend analysis" />
        </div>
      </div>
    </Card>
  );
}
