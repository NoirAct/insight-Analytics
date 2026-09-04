import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button, Field, PasswordField } from "@/components/ui/Form";
import { useAuth } from "@/contexts/AuthContext";
import { AuthLayout } from "@/layouts/AuthLayout";
import { loginSchema, type LoginFormValues } from "@/schemas/auth";

export function LoginPage() {
  const isDemo = import.meta.env.VITE_DEMO_MODE === "true";
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: isDemo ? "demo@insight.dev" : "",
      password: isDemo ? "DemoInsight2026!" : "",
      rememberMe: true,
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await login({
        email: values.email,
        password: values.password,
        rememberMe: values.rememberMe,
      });
      const redirectTo =
        (location.state as { from?: string } | null)?.from ?? "/app/dashboard";
      navigate(redirectTo, { replace: true });
    } catch (error) {
      if (isAxiosError(error)) {
        setFormError(error.response?.data?.error ?? "Falha no login");
        return;
      }
      setFormError("Falha no login");
    }
  });

  return (
    <AuthLayout title="Entrar" subtitle="Acesse seu painel de indicadores.">
      {isDemo ? (
        <p className="mb-4 rounded-lg border border-accent/30 bg-accent/10 p-3 text-sm text-muted">
          Demonstração somente leitura. As credenciais já estão preenchidas.
        </p>
      ) : null}
      <form className="space-y-4" onSubmit={onSubmit} noValidate>
        <Field
          label="E-mail"
          type="email"
          autoComplete="email"
          placeholder="voce@empresa.com"
          error={errors.email?.message}
          {...register("email")}
        />
        <PasswordField
          label="Senha"
          autoComplete="current-password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register("password")}
        />

        <div className="flex items-center justify-between gap-3 pt-1">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-muted">
            <input
              type="checkbox"
              className="size-4 cursor-pointer rounded border-border bg-bg accent-accent"
              {...register("rememberMe")}
            />
            Lembrar de mim
          </label>
          {!isDemo ? <Link to="/forgot-password" className="cursor-pointer text-sm text-accent transition hover:brightness-110">Esqueci a senha</Link> : null}
        </div>

        {formError ? <p className="text-sm text-danger">{formError}</p> : null}

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Entrando…" : "Entrar"}
        </Button>
      </form>

      {!isDemo ? <p className="mt-5 text-center text-sm text-muted">
        Não tem conta?{" "}
        <Link to="/register" className="cursor-pointer text-accent hover:brightness-110">
          Criar conta
        </Link>
      </p> : null}
    </AuthLayout>
  );
}
