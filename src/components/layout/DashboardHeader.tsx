import type { Retailer, TimeRange } from "@/lib/types";
import { RangeSelect } from "@/components/ui/RangeSelect";

interface DashboardHeaderProps {
  retailer: Retailer;
  title: string;
  ranges: TimeRange[];
  freshness: string;
}

export function DashboardHeader({
  retailer,
  title,
  ranges,
  freshness,
}: DashboardHeaderProps) {
  return (
    <header className="mb-10 flex flex-wrap items-start justify-between gap-6 lg:mb-14">
      <div>
        <p className="eyebrow text-muted">
          {retailer.name} · {retailer.market}
        </p>
        <h1 className="mt-3 max-w-2xl text-[2rem] leading-[1.1] font-semibold tracking-tight text-plum lg:text-[2.75rem]">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <span className="hidden items-center gap-2 text-xs text-muted sm:inline-flex">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-cerulean opacity-60" />
            <span className="relative inline-flex size-2 rounded-full bg-cerulean" />
          </span>
          {freshness}
        </span>
        <RangeSelect ranges={ranges} />
        <div className="flex size-9 items-center justify-center rounded-lg border border-line-strong bg-white text-[11px] font-semibold tracking-tight text-plum">
          {retailer.name}
        </div>
      </div>
    </header>
  );
}
