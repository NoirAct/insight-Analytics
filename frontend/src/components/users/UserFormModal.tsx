import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { X } from "lucide-react";
import { Button, Field, PasswordField } from "@/components/ui/Form";
import { userFormSchema, type UserFormValues } from "@/schemas/users";
import type { ManagedUser, Role } from "@/types/users";
import { cn } from "@/utils/cn";

export function UserFormModal({
  open,
  mode,
  user,
  roles,
  onClose,
  onSubmit,
}: {
  open: boolean;
  mode: "create" | "edit";
  user?: ManagedUser | null;
  roles: Role[];
  onClose: () => void;
  onSubmit: (values: UserFormValues, avatarFile: File | null) => Promise<void>;
}) {
  const [formError, setFormError] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      status: "ACTIVE",
      roleId: "",
    },
  });

  useEffect(() => {
    if (!open) return;
    setFormError(null);
    setAvatarFile(null);
    setPreview(user?.avatarUrl ?? null);
    reset({
      name: user?.name ?? "",
      email: user?.email ?? "",
      password: "",
      status: user?.status ?? "ACTIVE",
      roleId: user?.role?.id ?? "",
    });
  }, [open, user, reset]);

  if (!open) return null;

  const submit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      if (mode === "create" && !values.password) {
        setFormError("Senha obrigatória para novos usuários");
        return;
      }
      await onSubmit(values, avatarFile);
      onClose();
    } catch (error) {
      if (isAxiosError(error)) {
        setFormError(error.response?.data?.error ?? "Não foi possível salvar");
        return;
      }
      setFormError("Não foi possível salvar");
    }
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/60"
        aria-label="Fechar"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-lg rounded-(--radius-lg) border border-border bg-surface p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {mode === "create" ? "Novo usuário" : "Editar usuário"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-muted transition hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        <form className="space-y-3" onSubmit={submit} noValidate>
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex size-14 items-center justify-center overflow-hidden rounded-full bg-accent-soft text-lg font-semibold text-accent",
              )}
            >
              {preview ? (
                <img src={preview} alt="" className="size-full object-cover" />
              ) : (
                (user?.name ?? "U").slice(0, 1).toUpperCase()
              )}
            </div>
            <label className="cursor-pointer text-sm text-accent hover:brightness-110">
              Alterar foto
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0] ?? null;
                  setAvatarFile(file);
                  if (file) {
                    setPreview(URL.createObjectURL(file));
                  }
                }}
              />
            </label>
          </div>

          <Field
            label="Nome"
            error={errors.name?.message}
            {...register("name")}
          />
          <Field
            label="E-mail"
            type="email"
            error={errors.email?.message}
            {...register("email")}
          />
          <PasswordField
            label={mode === "create" ? "Senha" : "Nova senha (opcional)"}
            error={errors.password?.message}
            {...register("password")}
          />

          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-foreground/90">Status</span>
            <select
              className="w-full cursor-pointer rounded-(--radius-md) border border-border bg-bg px-3.5 py-2.5 text-sm outline-none focus:border-accent/50"
              {...register("status")}
            >
              <option value="ACTIVE">Ativo</option>
              <option value="INACTIVE">Inativo</option>
              <option value="INVITED">Convidado</option>
            </select>
          </label>

          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-foreground/90">Cargo</span>
            <select
              className="w-full cursor-pointer rounded-(--radius-md) border border-border bg-bg px-3.5 py-2.5 text-sm outline-none focus:border-accent/50"
              {...register("roleId")}
            >
              <option value="">Sem cargo</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </label>

          {formError ? <p className="text-sm text-danger">{formError}</p> : null}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-(--radius-md) border border-border px-4 py-2.5 text-sm text-muted transition hover:text-foreground"
            >
              Cancelar
            </button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? "Salvando…" : "Salvar"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
