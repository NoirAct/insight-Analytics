import { useState } from "react";
import { ErrorState } from "@/components/ui/ErrorState";
import { PageHeader } from "@/components/ui/PageHeader";

export function ReportsPage() {
  const [failed, setFailed] = useState(true);

  return (
    <div>
      <PageHeader
        title="Relatórios"
        description="Tabela com exportação CSV/PDF na etapa 7."
      />
      {failed ? (
        <ErrorState
          title="Relatórios ainda não disponíveis"
          description="Este empty error state demonstra o padrão visual. Clique para simular recuperação."
          onRetry={() => setFailed(false)}
        />
      ) : (
        <div className="rounded-(--radius-lg) border border-border bg-surface p-6 text-sm text-muted">
          Estado recuperado. A tabela completa chega na etapa 7.
        </div>
      )}
    </div>
  );
}
