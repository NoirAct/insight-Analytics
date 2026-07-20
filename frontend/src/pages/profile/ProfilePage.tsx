import { useMutation } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { useState } from "react";
import { Button, Field, PasswordField } from "@/components/ui/Form";
import { PageHeader } from "@/components/ui/PageHeader";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useToast } from "@/contexts/ToastContext";
import { profileApi } from "@/services/profile.service";
import type { User } from "@/types/auth";

function toAuthUser(user: User): User {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl,
    theme: user.theme,
    locale: user.locale,
    status: user.status,
    createdAt: user.createdAt,
  };
}

export function ProfilePage() {
  const { user, setUser } = useAuth();
  const { setTheme } = useTheme();
  const { toast } = useToast();

  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [locale, setLocale] = useState<"pt-BR" | "en-US">(
    (user?.locale as "pt-BR" | "en-US") ?? "pt-BR",
  );
  const [theme, setThemeLocal] = useState<"dark" | "light">(
    (user?.theme as "dark" | "light") ?? "dark",
  );
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const { data } = await profileApi.updateMe({
        name,
        email,
        locale,
        theme,
        currentPassword: currentPassword || undefined,
        newPassword: newPassword || undefined,
      });
      return data.user;
    },
    onSuccess: (updated) => {
      const next = toAuthUser(updated);
      setUser(next);
      setTheme(theme);
      setCurrentPassword("");
      setNewPassword("");
      setError(null);
      toast({ title: "Perfil atualizado", tone: "success" });
    },
    onError: (err) => {
      if (isAxiosError(err)) {
        setError(err.response?.data?.error ?? "Falha ao salvar");
        return;
      }
      setError("Falha ao salvar");
    },
  });

  const avatarMutation = useMutation({
    mutationFn: async (file: File) => {
      const { data } = await profileApi.uploadAvatar(file);
      return data.user;
    },
    onSuccess: (updated) => {
      setUser(toAuthUser(updated));
      toast({ title: "Foto atualizada", tone: "success" });
    },
  });

  return (
    <div>
      <PageHeader
        title="Perfil"
        description="Foto, dados pessoais, senha, tema e idioma."
      />

      <div className="max-w-xl space-y-4">
        <section className="rounded-(--radius-lg) border border-border bg-surface p-5">
          <div className="flex items-center gap-4">
            <div className="flex size-16 items-center justify-center overflow-hidden rounded-full bg-accent-soft text-xl font-semibold text-accent">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="" className="size-full object-cover" />
              ) : (
                user?.name?.slice(0, 1).toUpperCase()
              )}
            </div>
            <label className="cursor-pointer text-sm text-accent hover:brightness-110">
              Alterar foto
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) avatarMutation.mutate(file);
                }}
              />
            </label>
          </div>
        </section>

        <section className="space-y-3 rounded-(--radius-lg) border border-border bg-surface p-5">
          <Field label="Nome" value={name} onChange={(e) => setName(e.target.value)} />
          <Field
            label="E-mail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block space-y-1.5">
              <span className="text-sm font-medium">Tema</span>
              <select
                value={theme}
                onChange={(e) => setThemeLocal(e.target.value as "dark" | "light")}
                className="w-full rounded-(--radius-md) border border-border bg-bg px-3 py-2.5 text-sm"
              >
                <option value="dark">Escuro</option>
                <option value="light">Claro</option>
              </select>
            </label>
            <label className="block space-y-1.5">
              <span className="text-sm font-medium">Idioma</span>
              <select
                value={locale}
                onChange={(e) => setLocale(e.target.value as "pt-BR" | "en-US")}
                className="w-full rounded-(--radius-md) border border-border bg-bg px-3 py-2.5 text-sm"
              >
                <option value="pt-BR">Português (BR)</option>
                <option value="en-US">English (US)</option>
              </select>
            </label>
          </div>

          <PasswordField
            label="Senha atual"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
          <PasswordField
            label="Nova senha"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />

          {error ? <p className="text-sm text-danger">{error}</p> : null}

          <Button
            type="button"
            disabled={saveMutation.isPending}
            onClick={() => saveMutation.mutate()}
          >
            {saveMutation.isPending ? "Salvando…" : "Salvar alterações"}
          </Button>
        </section>
      </div>
    </div>
  );
}
