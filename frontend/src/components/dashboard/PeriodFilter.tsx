import type { DashboardRange } from "@/types/dashboard";
import { cn } from "@/utils/cn";

const PRESETS: { value: DashboardRange; label: string }[] = [
  { value: "today", label: "Hoje" },
  { value: "7d", label: "7 dias" },
  { value: "30d", label: "30 dias" },
  { value: "90d", label: "90 dias" },
  { value: "year", label: "Ano" },
  { value: "custom", label: "Personalizado" },
];

export function PeriodFilter({
  range,
  from,
  to,
  onRangeChange,
  onCustomChange,
}: {
  range: DashboardRange;
  from: string;
  to: string;
  onRangeChange: (range: DashboardRange) => void;
  onCustomChange: (next: { from: string; to: string }) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-1.5">
        {PRESETS.map((preset) => (
          <button
            key={preset.value}
            type="button"
            onClick={() => onRangeChange(preset.value)}
            className={cn(
              "rounded-(--radius-md) border px-3 py-1.5 text-xs font-medium transition",
              range === preset.value
                ? "border-accent/50 bg-accent-soft text-accent"
                : "border-border text-muted hover:border-accent/30 hover:text-foreground",
            )}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {range === "custom" ? (
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="date"
            value={from}
            onChange={(event) =>
              onCustomChange({ from: event.target.value, to })
            }
            className="rounded-(--radius-md) border border-border bg-surface px-3 py-1.5 text-sm text-foreground outline-none focus:border-accent/40"
          />
          <span className="text-xs text-muted">até</span>
          <input
            type="date"
            value={to}
            onChange={(event) =>
              onCustomChange({ from, to: event.target.value })
            }
            className="rounded-(--radius-md) border border-border bg-surface px-3 py-1.5 text-sm text-foreground outline-none focus:border-accent/40"
          />
        </div>
      ) : null}
    </div>
  );
}
