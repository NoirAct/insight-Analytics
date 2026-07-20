import { UserPlus } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";

export function UsersPage() {
  return (
    <div>
      <PageHeader
        title="Usuários"
        description="CRUD completo chega na etapa 5."
        actions={
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-(--radius-md) bg-accent px-3.5 py-2 text-sm font-semibold text-bg"
          >
            <UserPlus className="size-4" />
            Novo usuário
          </button>
        }
      />
      <EmptyState
        title="Nenhum usuário listado"
        description="A gestão com foto, cargo, permissões, filtros e paginação será implementada em seguida."
      />
    </div>
  );
}
