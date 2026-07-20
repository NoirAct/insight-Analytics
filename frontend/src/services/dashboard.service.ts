import { api } from "@/api/client";
import type {
  DashboardCharts,
  DashboardOverview,
  DashboardQuery,
} from "@/types/dashboard";

function toParams(query: DashboardQuery) {
  const params: Record<string, string> = { range: query.range };
  if (query.from) params.from = query.from;
  if (query.to) params.to = query.to;
  return params;
}

export const dashboardApi = {
  overview(query: DashboardQuery) {
    return api.get<DashboardOverview>("/dashboard/overview", {
      params: toParams(query),
    });
  },
  charts(query: DashboardQuery) {
    return api.get<DashboardCharts>("/dashboard/charts", {
      params: toParams(query),
    });
  },
};
