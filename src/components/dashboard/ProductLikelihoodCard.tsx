import type { ProductLikelihood } from "@/lib/types";
import { ProductLikelihoodChart } from "@/components/charts/ProductLikelihoodChart";
import { Card } from "@/components/ui/Card";

export function ProductLikelihoodCard({ data }: { data: ProductLikelihood[] }) {
  const leader = data.find((item) => item.emphasis === "highlight");

  return (
    <Card className="flex h-full flex-col p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold tracking-tight text-plum">
            Product likelihood
          </h3>
          <p className="mt-1 text-sm text-muted">
            Modelled dessert selection across the simulated missions.
          </p>
        </div>
        {leader ? (
          <span className="inline-flex items-center gap-2 text-xs text-muted">
            <span className="size-2.5 rounded-xs bg-popcorn ring-1 ring-line-strong" />
            {leader.name}
          </span>
        ) : null}
      </div>

      <div className="mt-6 flex-1">
        <ProductLikelihoodChart data={data} />
      </div>
    </Card>
  );
}
