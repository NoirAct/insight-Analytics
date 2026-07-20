import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { PeriodFilter } from "@/components/dashboard/PeriodFilter";
import {
  ConversionChart,
  OrdersChart,
  RevenueChart,
  SourcesChart,
  TopProductsChart,
  UsersChart,
} from "@/components/dashboard/Charts";
import { ErrorState } from "@/components/ui/ErrorState";
import { PageHeader } from "@/components/ui/PageHeader";
import { PageSkeleton } from "@/components/ui/Skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { dashboardApi } from "@/services/dashboard.service";
import type { DashboardRange } from "@/types/dashboard";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function daysAgoIso(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
}

export function DashboardPage() {
  const { user } = useAuth();
  const [range, setRange] = useState<DashboardRange>("30d");
  const [from, setFrom] = useState(daysAgoIso(29));
  const [to, setTo] = useState(todayIso());

  const query = useMemo(
    () => ({
      range,
      from: range === "custom" ? from : undefined,
      to: range === "custom" ? to : undefined,
    }),
    [range, from, to],
  );

  const overview = useQuery({
    queryKey: ["dashboard", "overview", query],
    queryFn: async () => {
      const { data } = await dashboardApi.overview(query);
      return data;
    },
  });

  const charts = useQuery({
    queryKey: ["dashboard", "charts", query],
    queryFn: async () => {
      const { data } = await dashboardApi.charts(query);
      return data;
    },
  });

  const loading = overview.isLoading || charts.isLoading;
  const error = overview.isError || charts.isError;

  if (loading) {
    return <PageSkeleton />;
  }

  if (error || !overview.data || !charts.data) {
    return (
      <ErrorState
        title="Não foi possível carregar o dashboard"
        description="Verifique a API e tente novamente."
        onRetry={() => {
          void overview.refetch();
          void charts.refetch();
        }}
      />
    );
  }

  return (
    <div>
      <PageHeader
        title={`Olá, ${user?.name?.split(" ")[0] ?? "time"}`}
        description={`Indicadores · ${overview.data.period.label}`}
      />

      <div className="mb-5">
        <PeriodFilter
          range={range}
          from={from}
          to={to}
          onRangeChange={(next) => {
            setRange(next);
            if (next === "custom") {
              setFrom(daysAgoIso(29));
              setTo(todayIso());
            }
          }}
          onCustomChange={({ from: nextFrom, to: nextTo }) => {
            setFrom(nextFrom);
            setTo(nextTo);
          }}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {overview.data.kpis.map((item) => (
          <KpiCard key={item.key} item={item} />
        ))}
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <RevenueChart
          data={charts.data.revenueByPeriod}
          granularity={charts.data.period.granularity}
        />
        <UsersChart
          data={charts.data.newUsers}
          granularity={charts.data.period.granularity}
        />
        <OrdersChart
          data={charts.data.orders}
          granularity={charts.data.period.granularity}
        />
        <ConversionChart
          data={charts.data.conversion}
          granularity={charts.data.period.granularity}
        />
        <TopProductsChart data={charts.data.topProducts} />
        <SourcesChart data={charts.data.userSources} />
      </div>
    </div>
  );
}
