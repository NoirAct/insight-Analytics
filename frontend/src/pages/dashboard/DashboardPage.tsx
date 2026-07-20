import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { PageSkeleton } from "@/components/ui/Skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";

const KPI_LABELS = [
  "Receita",
  "Usuários",
  "Conversões",
  "Pedidos",
  "Ticket Médio",
  "Lucro",
];

export function DashboardPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 700);
    return () => window.clearTimeout(timer);
  }, []);

  if (loading) {
    return <PageSkeleton />;
  }

  return (
    <div>
      <PageHeader
        title={`Olá, ${user?.name?.split(" ")[0] ?? "time"}`}
        description="Visão geral dos indicadores. Dados reais entram na etapa 4."
        actions={
          <button
            type="button"
            onClick={() =>
              toast({
                title: "Layout pronto",
                description: "Toasts e shell ativos.",
                tone: "success",
              })
            }
            className="rounded-(--radius-md) bg-accent px-3.5 py-2 text-sm font-semibold text-bg transition hover:brightness-110"
          >
            Testar toast
          </button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {KPI_LABELS.map((label) => (
          <div
            key={label}
            className="rounded-(--radius-lg) border border-border bg-surface p-4 transition hover:border-accent/30"
          >
            <p className="text-xs font-medium tracking-wide text-muted uppercase">
              {label}
            </p>
            <p className="mt-3 font-mono text-2xl font-semibold tracking-tight">
              —
            </p>
            <p className="mt-1 text-xs text-muted">vs período anterior</p>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <div className="min-h-64 rounded-(--radius-lg) border border-border bg-surface p-4">
          <p className="text-sm font-medium">Receita por mês</p>
          <p className="mt-2 text-sm text-muted">
            Gráfico Recharts na próxima etapa.
          </p>
        </div>
        <div className="min-h-64 rounded-(--radius-lg) border border-border bg-surface p-4">
          <p className="text-sm font-medium">Origem dos usuários</p>
          <p className="mt-2 text-sm text-muted">
            Filtros de período (hoje → custom) na etapa 4.
          </p>
        </div>
      </div>
    </div>
  );
}
