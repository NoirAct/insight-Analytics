export type DashboardRange = "today" | "7d" | "30d" | "90d" | "year" | "custom";

export type KpiItem = {
  key: string;
  label: string;
  value: number;
  previous: number;
  change: number;
  format: "currency" | "number";
};

export type DashboardOverview = {
  period: {
    range: DashboardRange;
    label: string;
    from: string;
    to: string;
  };
  kpis: KpiItem[];
};

export type ChartPoint = {
  label: string;
  value: number;
};

export type NamedValue = {
  name: string;
  value: number;
};

export type DashboardCharts = {
  period: {
    range: DashboardRange;
    label: string;
    from: string;
    to: string;
    granularity: "day" | "month";
  };
  revenueByPeriod: ChartPoint[];
  newUsers: ChartPoint[];
  orders: ChartPoint[];
  conversion: ChartPoint[];
  topProducts: NamedValue[];
  userSources: NamedValue[];
};

export type DashboardQuery = {
  range: DashboardRange;
  from?: string;
  to?: string;
};
