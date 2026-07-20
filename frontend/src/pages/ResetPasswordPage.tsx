import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button, Field } from "@/components/ui/Form";
import { AuthLayout } from "@/layouts/AuthLayout";
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from "@/schemas/auth";
import { authApi } from "@/services/auth.service";

export function ResetPasswordPage() {
  const [params] = useSearchParams();
  const token = useMemo(() => params.get("token") ?? "", [params]);
  const navigate = useNavigate();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    if (!token) {
      setFormError("Token de recuperação ausente");
      return;
    }

    try {
      await authApi.resetPassword(token, values.password);
      navigate("/login", { replace: true });
    } catch (error) {
      if (isAxiosError(error)) {
        setFormError(error.response?.data?.error ?? "Não foi possível resetar");
        return;
      }
      setFormError("Não foi possível resetar");
    }
  });

  return (
    <AuthLayout title="Nova senha" subtitle="Defina uma senha forte para sua conta.">
      <form className="space-y-4" onSubmit={onSubmit} noValidate>
        <Field
          label="Nova senha"
          type="password"
          autoComplete="new-password"
          placeholder="Mínimo 8 caracteres"
          error={errors.password?.message}
          {...register("password")}
        />
        <Field
          label="Confirmar senha"
          type="password"
          autoComplete="new-password"
          placeholder="Repita a senha"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        {formError ? <p className="text-sm text-danger">{formError}</p> : null}

        <Button type="submit" disabled={isSubmitting || !token}>
          {isSubmitting ? "Salvando…" : "Salvar senha"}
        </Button>
      </form>

      <p className="mt-5 text-center text-sm text-muted">
        <Link to="/login" className="text-accent hover:brightness-110">
          Voltar ao login
        </Link>
      </p>
    </AuthLayout>
  );
}
