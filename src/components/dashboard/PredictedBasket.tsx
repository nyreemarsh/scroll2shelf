import type { PredictedBasket as PredictedBasketData } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { CountUp } from "@/components/ui/CountUp";
import { cn, formatPrice } from "@/lib/utils";

export function PredictedBasket({ basket }: { basket: PredictedBasketData }) {
  const total = basket.items.reduce((sum, item) => sum + item.product.price, 0);

  return (
    <Card className="flex h-full flex-col p-6 sm:p-8">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-lg font-semibold tracking-tight text-plum">
          Predicted basket
        </h3>
        <Chip tone="cerulean">Simulated</Chip>
      </div>

      <ol className="relative mt-5 flex-1">
        <span
          aria-hidden
          className="absolute top-3 bottom-3 left-[5px] w-px bg-line"
        />
        {basket.items.map((item) => (
          <li
            key={item.id}
            className={cn(
              "relative flex items-center gap-4 py-3 pr-3 pl-7",
              item.highlight && "rounded-md bg-popcorn-50",
            )}
          >
            <span
              aria-hidden
              className={cn(
                "absolute top-1/2 left-0 size-[11px] -translate-y-1/2 rounded-full border-2 bg-white",
                item.highlight ? "border-popcorn" : "border-line-strong",
              )}
            />
            <div className="min-w-0 flex-1">
              <p className="eyebrow text-muted">{item.course}</p>
              <p className="mt-1 truncate text-sm font-medium text-plum">
                {item.product.name}
              </p>
            </div>
            <span className="shrink-0 text-sm font-medium text-plum tabular-nums">
              {formatPrice(item.product.price)}
            </span>
          </li>
        ))}
      </ol>

      <div className="mt-6 border-t border-line pt-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <CountUp
              value={total}
              prefix="£"
              decimals={2}
              className="text-4xl font-semibold tracking-tight text-plum tabular-nums lg:text-[2.75rem]"
            />
            <p className="mt-1 text-sm text-muted">predicted basket</p>
          </div>
          <p className="max-w-[20ch] text-xs leading-relaxed text-muted sm:text-right">
            {basket.basis}
          </p>
        </div>
      </div>
    </Card>
  );
}
