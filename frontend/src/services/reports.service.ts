import { api, getAccessToken } from "@/api/client";
import type { ReportsListResponse, ReportsQuery } from "@/types/reports";

function toParams(query: ReportsQuery) {
  return {
    page: query.page,
    pageSize: query.pageSize,
    search: query.search || undefined,
    sortBy: query.sortBy,
    sortDir: query.sortDir,
  };
}

export const reportsApi = {
  list(params: ReportsQuery) {
    return api.get<ReportsListResponse>("/reports/orders", {
      params: toParams(params),
    });
  },

  async downloadExport(format: "csv" | "pdf", params: ReportsQuery) {
    const search = new URLSearchParams();
    Object.entries(toParams(params)).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        search.set(key, String(value));
      }
    });

    const response = await fetch(
      `/api/reports/orders/export.${format}?${search.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${getAccessToken() ?? ""}`,
        },
        credentials: "include",
      },
    );

    if (!response.ok) {
      throw new Error("Falha ao exportar relatório");
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `relatorio-pedidos.${format}`;
    anchor.click();
    URL.revokeObjectURL(url);
  },
};
