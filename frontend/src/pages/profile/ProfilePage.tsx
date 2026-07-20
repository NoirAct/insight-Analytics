import { PageHeader } from "@/components/ui/PageHeader";
import { useAuth } from "@/contexts/AuthContext";

export function ProfilePage() {
  const { user } = useAuth();

  return (
    <div>
      <PageHeader
        title="Perfil"
        description="Foto, senha, tema e idioma (estrutura) na etapa 7."
      />

      <div className="max-w-lg rounded-(--radius-lg) border border-border bg-surface p-5">
        <div className="flex items-center gap-4">
          <div className="flex size-14 items-center justify-center rounded-full bg-accent-soft font-semibold text-accent">
            {user?.name?.slice(0, 1).toUpperCase() ?? "U"}
          </div>
          <div>
            <p className="font-medium">{user?.name}</p>
            <p className="font-mono text-sm text-muted">{user?.email}</p>
          </div>
        </div>

        <dl className="mt-6 space-y-3 text-sm">
          <div className="flex justify-between border-b border-border py-2">
            <dt className="text-muted">Tema preferido</dt>
            <dd className="capitalize">{user?.theme ?? "dark"}</dd>
          </div>
          <div className="flex justify-between border-b border-border py-2">
            <dt className="text-muted">Idioma</dt>
            <dd>{user?.locale ?? "pt-BR"}</dd>
          </div>
          <div className="flex justify-between py-2">
            <dt className="text-muted">Status</dt>
            <dd>{user?.status ?? "ACTIVE"}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
