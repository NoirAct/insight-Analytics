export function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("pt-BR").format(value);
}

export function formatCompact(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatChartLabel(label: string, granularity: "day" | "month") {
  if (granularity === "month") {
    const [year, month] = label.split("-");
    const date = new Date(Number(year), Number(month) - 1, 1);
    return date.toLocaleDateString("pt-BR", { month: "short" });
  }

  const date = new Date(`${label}T12:00:00`);
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}
