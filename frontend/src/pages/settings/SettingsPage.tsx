import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Button, Field } from "@/components/ui/Form";
import { PageHeader } from "@/components/ui/PageHeader";
import { Skeleton } from "@/components/ui/Skeleton";
import { useTheme } from "@/contexts/ThemeContext";
import { useToast } from "@/contexts/ToastContext";
import { profileApi } from "@/services/profile.service";

export function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [companyName, setCompanyName] = useState("");
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [productAlerts, setProductAlerts] = useState(true);

  const companyQuery = useQuery({
    queryKey: ["company"],
    queryFn: async () => {
      const { data } = await profileApi.getCompany();
      return data.company;
    },
  });

  const sessionsQuery = useQuery({
    queryKey: ["sessions"],
    queryFn: async () => {
      const { data } = await profileApi.listSessions();
      return data.sessions;
    },
  });

  const notificationsQuery = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const { data } = await profileApi.listNotifications();
      return data.notifications;
    },
  });

  useEffect(() => {
    if (companyQuery.data?.name) {
      setCompanyName(companyQuery.data.name);
    }
  }, [companyQuery.data?.name]);

  const saveCompany = useMutation({
    mutationFn: async () => {
      const { data } = await profileApi.updateCompany({ name: companyName });
      return data.company;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["company"] });
      toast({ title: "Empresa atualizada", tone: "success" });
    },
  });

  const logoMutation = useMutation({
    mutationFn: async (file: File) => {
      const { data } = await profileApi.uploadCompanyLogo(file);
      return data.company;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["company"] });
      toast({ title: "Logo atualizada", tone: "success" });
    },
  });

  const revokeMutation = useMutation({
    mutationFn: (id: string) => profileApi.revokeSession(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["sessions"] });
      toast({ title: "Sessão encerrada", tone: "info" });
    },
  });

  const readMutation = useMutation({
    mutationFn: (id: string) => profileApi.markNotificationRead(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  return (
    <div>
      <PageHeader
        title="Configurações"
        description="Empresa, preferências, notificações e sessões ativas."
      />

      <div className="mx-auto grid max-w-4xl gap-4 lg:grid-cols-2">
        <section className="rounded-(--radius-lg) border border-border bg-surface p-5">
          <h2 className="text-sm font-semibold">Aparência</h2>
          <p className="mt-1 text-sm text-muted">Tema do aplicativo.</p>
          <div className="mt-4 flex gap-2">
            {(["dark", "light"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  setTheme(option);
                  toast({
                    title: option === "dark" ? "Tema escuro" : "Tema claro",
                    tone: "success",
                  });
                }}
                className={`rounded-(--radius-md) border px-3.5 py-2 text-sm transition ${
                  theme === option
                    ? "border-accent/50 bg-accent-soft text-accent"
                    : "border-border text-muted hover:text-foreground"
                }`}
              >
                {option === "dark" ? "Escuro" : "Claro"}
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-(--radius-lg) border border-border bg-surface p-5">
          <h2 className="text-sm font-semibold">Empresa</h2>
          {companyQuery.isLoading ? (
            <Skeleton className="mt-4 h-24 w-full" />
          ) : (
            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex size-12 items-center justify-center overflow-hidden rounded-(--radius-md) border border-border bg-bg">
                  {companyQuery.data?.logoUrl ? (
                    <img
                      src={companyQuery.data.logoUrl}
                      alt=""
                      className="size-full object-cover"
                    />
                  ) : (
                    <span className="text-[10px] text-muted">LOGO</span>
                  )}
                </div>
                <label className="cursor-pointer text-sm text-accent">
                  Alterar logo
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) logoMutation.mutate(file);
                    }}
                  />
                </label>
              </div>
              <Field
                label="Nome da empresa"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
              <Button
                type="button"
                disabled={saveCompany.isPending}
                onClick={() => saveCompany.mutate()}
              >
                Salvar empresa
              </Button>
            </div>
          )}
        </section>

        <section className="rounded-(--radius-lg) border border-border bg-surface p-5">
          <h2 className="text-sm font-semibold">Preferências de notificação</h2>
          <div className="mt-4 space-y-3 text-sm">
            <label className="flex items-center justify-between gap-3">
              <span>Alertas por e-mail</span>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => {
                  setEmailAlerts(e.target.checked);
                  toast({ title: "Preferência salva localmente", tone: "info" });
                }}
              />
            </label>
            <label className="flex items-center justify-between gap-3">
              <span>Alertas de estoque/produtos</span>
              <input
                type="checkbox"
                checked={productAlerts}
                onChange={(e) => {
                  setProductAlerts(e.target.checked);
                  toast({ title: "Preferência salva localmente", tone: "info" });
                }}
              />
            </label>
          </div>

          <div className="mt-5 space-y-2">
            <p className="text-xs tracking-wide text-muted uppercase">Inbox</p>
            {(notificationsQuery.data ?? []).length === 0 ? (
              <p className="text-sm text-muted">Sem notificações.</p>
            ) : (
              (notificationsQuery.data ?? []).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    if (!item.read) readMutation.mutate(item.id);
                  }}
                  className={`w-full rounded-(--radius-md) border px-3 py-2 text-left transition ${
                    item.read
                      ? "border-border text-muted"
                      : "border-accent/30 bg-accent-soft/40"
                  }`}
                >
                  <p className="text-sm font-medium text-foreground">{item.title}</p>
                  <p className="text-xs text-muted">{item.body}</p>
                </button>
              ))
            )}
          </div>
        </section>

        <section className="rounded-(--radius-lg) border border-border bg-surface p-5">
          <h2 className="text-sm font-semibold">Sessões ativas</h2>
          <div className="mt-4 space-y-2">
            {sessionsQuery.isLoading ? (
              <Skeleton className="h-20 w-full" />
            ) : (sessionsQuery.data ?? []).length === 0 ? (
              <p className="text-sm text-muted">Nenhuma sessão registrada.</p>
            ) : (
              (sessionsQuery.data ?? []).map((session) => (
                <div
                  key={session.id}
                  className="flex items-start justify-between gap-3 rounded-(--radius-md) border border-border px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm">
                      {session.userAgent ?? "Dispositivo desconhecido"}
                    </p>
                    <p className="text-xs text-muted">
                      {session.ipAddress ?? "IP n/d"} ·{" "}
                      {new Date(session.createdAt).toLocaleString("pt-BR")}
                      {session.active ? " · ativa" : " · expirada"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => revokeMutation.mutate(session.id)}
                    className="shrink-0 text-xs text-danger hover:underline"
                  >
                    Encerrar
                  </button>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
