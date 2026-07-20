export type DateRange = {
  start: Date;
  end: Date;
  previousStart: Date;
  previousEnd: Date;
  label: string;
};

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function endOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(23, 59, 59, 999);
  return next;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function withPrevious(start: Date, end: Date, label: string): DateRange {
  const duration = end.getTime() - start.getTime();
  const previousEnd = new Date(start.getTime() - 1);
  const previousStart = new Date(previousEnd.getTime() - duration);
  return {
    start,
    end,
    previousStart,
    previousEnd,
    label,
  };
}

export function resolvePeriod(input: {
  range: "today" | "7d" | "30d" | "90d" | "year" | "custom";
  from?: string;
  to?: string;
}): DateRange {
  const now = new Date();

  if (input.range === "custom") {
    if (!input.from || !input.to) {
      throw new Error("Informe from e to para o período personalizado");
    }
    const start = startOfDay(new Date(input.from));
    const end = endOfDay(new Date(input.to));
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) {
      throw new Error("Período personalizado inválido");
    }
    return withPrevious(start, end, "Personalizado");
  }

  if (input.range === "today") {
    return withPrevious(startOfDay(now), endOfDay(now), "Hoje");
  }

  if (input.range === "year") {
    const start = startOfDay(new Date(now.getFullYear(), 0, 1));
    return withPrevious(start, endOfDay(now), "Ano");
  }

  const days = input.range === "7d" ? 7 : input.range === "90d" ? 90 : 30;
  const end = endOfDay(now);
  const start = startOfDay(addDays(now, -(days - 1)));
  const labels = { "7d": "7 dias", "30d": "30 dias", "90d": "90 dias" } as const;
  return withPrevious(start, end, labels[input.range as "7d" | "30d" | "90d"]);
}

export function percentChange(current: number, previous: number) {
  if (previous === 0) {
    return current === 0 ? 0 : 100;
  }
  return Number((((current - previous) / previous) * 100).toFixed(1));
}

export function toNumber(value: { toNumber?: () => number } | number | null | undefined) {
  if (value == null) return 0;
  if (typeof value === "number") return value;
  if (typeof value.toNumber === "function") return value.toNumber();
  return Number(value);
}

export function formatBucketKey(date: Date, granularity: "day" | "month") {
  if (granularity === "month") {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  }
  return date.toISOString().slice(0, 10);
}

export function chooseGranularity(start: Date, end: Date): "day" | "month" {
  const days =
    Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  return days > 90 ? "month" : "day";
}
