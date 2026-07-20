import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import type { KpiItem } from "@/types/dashboard";
import { cn } from "@/utils/cn";
import { formatCurrency, formatNumber } from "@/utils/format";

export function KpiCard({ item }: { item: KpiItem }) {
  const positive = item.change >= 0;
  const formatted =
    item.format === "currency"
      ? formatCurrency(item.value)
      : formatNumber(item.value);

  return (
    <div className="rounded-(--radius-lg) border border-border bg-surface p-4 transition hover:border-accent/30">
      <p className="text-xs font-medium tracking-wide text-muted uppercase">
        {item.label}
      </p>
      <p className="mt-3 font-mono text-2xl font-semibold tracking-tight">
        {formatted}
      </p>
      <div
        className={cn(
          "mt-2 inline-flex items-center gap-1 text-xs font-medium",
          positive ? "text-success" : "text-danger",
        )}
      >
        {positive ? (
          <ArrowUpRight className="size-3.5" />
        ) : (
          <ArrowDownRight className="size-3.5" />
        )}
        {Math.abs(item.change)}% vs período anterior
      </div>
    </div>
  );
}
