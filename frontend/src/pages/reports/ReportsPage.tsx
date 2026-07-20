import { useQuery } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, Download, FileText, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { PageHeader } from "@/components/ui/PageHeader";
import { Pagination } from "@/components/ui/Pagination";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/contexts/ToastContext";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { reportsApi } from "@/services/reports.service";
import type { ReportSortBy } from "@/types/reports";
import { cn } from "@/utils/cn";
import { formatCurrency, formatNumber } from "@/utils/format";

const COLUMNS: { key: ReportSortBy; label: string }[] = [
  { key: "customerName", label: "Cliente" },
  { key: "total", label: "Total" },
  { key: "status", label: "Status" },
  { key: "source", label: "Origem" },
  { key: "createdAt", label: "Data" },
];

export function ReportsPage() {
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<ReportSortBy>("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [exporting, setExporting] = useState<"csv" | "pdf" | null>(null);

  const debouncedSearch = useDebouncedValue(search, 350);

  const query = useMemo(
    () => ({
      page,
      pageSize: 10,
      search: debouncedSearch || undefined,
      sortBy,
      sortDir,
    }),
    [page, debouncedSearch, sortBy, sortDir],
  );

  const reportsQuery = useQuery({
    queryKey: ["reports", query],
    queryFn: async () => {
      const { data } = await reportsApi.list(query);
      return data;
    },
  });

  function toggleSort(column: ReportSortBy) {
    if (sortBy === column) {
      setSortDir((current) => (current === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(column);
      setSortDir("asc");
    }
    setPage(1);
  }

  async function handleExport(format: "csv" | "pdf") {
    setExporting(format);
    try {
      await reportsApi.downloadExport(format, query);
      toast({ title: `Exportação ${format.toUpperCase()} iniciada`, tone: "success" });
    } catch {
      toast({ title: "Falha ao exportar", tone: "error" });
    } finally {
      setExporting(null);
    }
  }

  const rows = reportsQuery.data?.data ?? [];
  const meta = reportsQuery.data?.meta;

  return (
    <div>
      <PageHeader
        title="Relatórios"
        description="Pedidos com ordenação, busca e exportação CSV/PDF."
        actions={
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={exporting !== null}
              onClick={() => void handleExport("csv")}
              className="inline-flex items-center gap-2 rounded-(--radius-md) border border-border px-3 py-2 text-sm text-muted transition hover:text-foreground disabled:opacity-50"
            >
              <Download className="size-4" />
              {exporting === "csv" ? "CSV…" : "CSV"}
            </button>
            <button
              type="button"
              disabled={exporting !== null}
              onClick={() => void handleExport("pdf")}
              className="inline-flex items-center gap-2 rounded-(--radius-md) bg-accent px-3 py-2 text-sm font-semibold text-bg transition hover:brightness-110 disabled:opacity-50"
            >
              <FileText className="size-4" />
              {exporting === "pdf" ? "PDF…" : "PDF"}
            </button>
          </div>
        }
      />

      <div className="mb-4">
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" />
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Buscar cliente, status ou origem"
            className="w-full rounded-(--radius-md) border border-border bg-surface py-2.5 pr-3 pl-10 text-sm outline-none focus:border-accent/40"
          />
        </div>
      </div>

      {reportsQuery.isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-12 w-full" />
          ))}
        </div>
      ) : reportsQuery.isError ? (
        <ErrorState onRetry={() => void reportsQuery.refetch()} />
      ) : rows.length === 0 ? (
        <EmptyState
          title="Nenhum pedido encontrado"
          description="Ajuste a busca ou aguarde novos pedidos."
        />
      ) : (
        <div className="overflow-hidden rounded-(--radius-lg) border border-border bg-surface">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-border text-xs tracking-wide text-muted uppercase">
                <tr>
                  {COLUMNS.map((column) => (
                    <th key={column.key} className="px-4 py-3 font-medium">
                      <button
                        type="button"
                        onClick={() => toggleSort(column.key)}
                        className="inline-flex items-center gap-1 transition hover:text-foreground"
                      >
                        {column.label}
                        {sortBy === column.key ? (
                          sortDir === "asc" ? (
                            <ArrowUp className="size-3.5" />
                          ) : (
                            <ArrowDown className="size-3.5" />
                          )
                        ) : null}
                      </button>
                    </th>
                  ))}
                  <th className="px-4 py-3 font-medium">Itens</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-border/70 last:border-0 hover:bg-border/20"
                  >
                    <td className="px-4 py-3 font-medium">{row.customerName}</td>
                    <td className="px-4 py-3 font-mono">{formatCurrency(row.total)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-xs",
                          row.status === "completed"
                            ? "bg-success/15 text-success"
                            : "bg-border/60 text-muted",
                        )}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted">{row.source}</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted">
                      {new Date(row.createdAt).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-4 py-3 font-mono">{formatNumber(row.itemsCount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {meta ? (
            <div className="flex items-center justify-between border-t border-border px-4 py-3">
              <p className="text-xs text-muted">{meta.total} pedidos</p>
              <Pagination
                page={meta.page}
                totalPages={meta.totalPages}
                onPageChange={setPage}
              />
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
