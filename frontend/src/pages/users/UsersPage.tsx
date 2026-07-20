import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Search, Trash2, UserPlus } from "lucide-react";
import { useMemo, useState } from "react";
import { UserFormModal } from "@/components/users/UserFormModal";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { PageHeader } from "@/components/ui/PageHeader";
import { Pagination } from "@/components/ui/Pagination";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/contexts/ToastContext";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import type { UserFormValues } from "@/schemas/users";
import { usersApi } from "@/services/users.service";
import type { ManagedUser, UserStatus } from "@/types/users";
import { cn } from "@/utils/cn";

const STATUS_LABEL: Record<UserStatus, string> = {
  ACTIVE: "Ativo",
  INACTIVE: "Inativo",
  INVITED: "Convidado",
};

export function UsersPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<UserStatus | "">("");
  const [roleId, setRoleId] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ManagedUser | null>(null);

  const debouncedSearch = useDebouncedValue(search, 350);

  const queryKey = useMemo(
    () => ["users", { page, search: debouncedSearch, status, roleId }],
    [page, debouncedSearch, status, roleId],
  );

  const usersQuery = useQuery({
    queryKey,
    queryFn: async () => {
      const { data } = await usersApi.list({
        page,
        pageSize: 10,
        search: debouncedSearch || undefined,
        status: status || undefined,
        roleId: roleId || undefined,
      });
      return data;
    },
  });

  const rolesQuery = useQuery({
    queryKey: ["roles"],
    queryFn: async () => {
      const { data } = await usersApi.getRoles();
      return data.roles;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async ({
      values,
      avatarFile,
      userId,
    }: {
      values: UserFormValues;
      avatarFile: File | null;
      userId?: string;
    }) => {
      const payload = {
        name: values.name,
        email: values.email,
        status: values.status,
        roleId: values.roleId || null,
        password: values.password || undefined,
      };

      let saved: ManagedUser;
      if (userId) {
        const { data } = await usersApi.update(userId, payload);
        saved = data.user;
      } else {
        const { data } = await usersApi.create({
          ...payload,
          password: values.password!,
        });
        saved = data.user;
      }

      if (avatarFile) {
        const { data } = await usersApi.uploadAvatar(saved.id, avatarFile);
        saved = data.user;
      }

      return saved;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({
        title: editing ? "Usuário atualizado" : "Usuário criado",
        tone: "success",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => usersApi.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({ title: "Usuário removido", tone: "info" });
    },
    onError: (error: unknown) => {
      const message =
        (error as { response?: { data?: { error?: string } } })?.response?.data
          ?.error ?? "Falha ao remover";
      toast({ title: message, tone: "error" });
    },
  });

  const roles = rolesQuery.data ?? [];
  const users = usersQuery.data?.data ?? [];
  const meta = usersQuery.data?.meta;

  return (
    <div>
      <PageHeader
        title="Usuários"
        description="CRUD com cargo, permissões, status, foto e paginação."
        actions={
          <button
            type="button"
            onClick={() => {
              setEditing(null);
              setModalOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-(--radius-md) bg-accent px-3.5 py-2 text-sm font-semibold text-bg transition hover:brightness-110"
          >
            <UserPlus className="size-4" />
            Novo usuário
          </button>
        }
      />

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" />
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Buscar por nome ou e-mail"
            className="w-full rounded-(--radius-md) border border-border bg-surface py-2.5 pr-3 pl-10 text-sm outline-none focus:border-accent/40"
          />
        </div>

        <select
          value={status}
          onChange={(event) => {
            setStatus(event.target.value as UserStatus | "");
            setPage(1);
          }}
          className="rounded-(--radius-md) border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-accent/40"
        >
          <option value="">Todos os status</option>
          <option value="ACTIVE">Ativo</option>
          <option value="INACTIVE">Inativo</option>
          <option value="INVITED">Convidado</option>
        </select>

        <select
          value={roleId}
          onChange={(event) => {
            setRoleId(event.target.value);
            setPage(1);
          }}
          className="rounded-(--radius-md) border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-accent/40"
        >
          <option value="">Todos os cargos</option>
          {roles.map((role) => (
            <option key={role.id} value={role.id}>
              {role.name}
            </option>
          ))}
        </select>
      </div>

      {usersQuery.isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-14 w-full" />
          ))}
        </div>
      ) : usersQuery.isError ? (
        <ErrorState onRetry={() => void usersQuery.refetch()} />
      ) : users.length === 0 ? (
        <EmptyState
          title="Nenhum usuário encontrado"
          description="Ajuste os filtros ou cadastre um novo usuário."
        />
      ) : (
        <div className="overflow-hidden rounded-(--radius-lg) border border-border bg-surface">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-border text-xs tracking-wide text-muted uppercase">
                <tr>
                  <th className="px-4 py-3 font-medium">Usuário</th>
                  <th className="px-4 py-3 font-medium">Cargo</th>
                  <th className="px-4 py-3 font-medium">Permissões</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-border/70 last:border-0 hover:bg-border/20"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex size-9 items-center justify-center overflow-hidden rounded-full bg-accent-soft text-xs font-semibold text-accent">
                          {user.avatarUrl ? (
                            <img
                              src={user.avatarUrl}
                              alt=""
                              className="size-full object-cover"
                            />
                          ) : (
                            user.name.slice(0, 1).toUpperCase()
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{user.name}</p>
                          <p className="font-mono text-xs text-muted">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {user.role?.name ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex max-w-56 flex-wrap gap-1">
                        {(user.role?.permissions ?? []).slice(0, 3).map((permission) => (
                          <span
                            key={permission.id}
                            className="rounded-md bg-border/50 px-1.5 py-0.5 font-mono text-[10px] text-muted"
                          >
                            {permission.key}
                          </span>
                        ))}
                        {(user.role?.permissions?.length ?? 0) > 3 ? (
                          <span className="text-[10px] text-muted">
                            +{(user.role?.permissions.length ?? 0) - 3}
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                          user.status === "ACTIVE" && "bg-success/15 text-success",
                          user.status === "INACTIVE" && "bg-danger/15 text-danger",
                          user.status === "INVITED" && "bg-warning/15 text-warning",
                        )}
                      >
                        {STATUS_LABEL[user.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setEditing(user);
                            setModalOpen(true);
                          }}
                          className="rounded-md p-2 text-muted transition hover:bg-border/40 hover:text-foreground"
                          aria-label="Editar"
                        >
                          <Pencil className="size-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Remover ${user.name}?`)) {
                              deleteMutation.mutate(user.id);
                            }
                          }}
                          className="rounded-md p-2 text-muted transition hover:bg-danger/10 hover:text-danger"
                          aria-label="Remover"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {meta ? (
            <div className="flex items-center justify-between border-t border-border px-4 py-3">
              <p className="text-xs text-muted">
                {meta.total} usuário{meta.total === 1 ? "" : "s"}
              </p>
              <Pagination
                page={meta.page}
                totalPages={meta.totalPages}
                onPageChange={setPage}
              />
            </div>
          ) : null}
        </div>
      )}

      <UserFormModal
        open={modalOpen}
        mode={editing ? "edit" : "create"}
        user={editing}
        roles={roles}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        onSubmit={async (values, avatarFile) => {
          await saveMutation.mutateAsync({
            values,
            avatarFile,
            userId: editing?.id,
          });
        }}
      />
    </div>
  );
}
