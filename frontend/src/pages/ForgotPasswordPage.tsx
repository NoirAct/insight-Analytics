import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { Button, Field } from "@/components/ui/Form";
import { AuthLayout } from "@/layouts/AuthLayout";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from "@/schemas/auth";
import { authApi } from "@/services/auth.service";

export function ForgotPasswordPage() {
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [devResetUrl, setDevResetUrl] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    setSuccess(null);
    setDevResetUrl(null);
    try {
      const { data } = await authApi.forgotPassword(values.email);
      setSuccess(data.message);
      if (data.resetUrl) setDevResetUrl(data.resetUrl);
    } catch (error) {
      if (isAxiosError(error)) {
        setFormError(error.response?.data?.error ?? "Não foi possível enviar");
        return;
      }
      setFormError("Não foi possível enviar");
    }
  });

  return (
    <AuthLayout
      title="Recuperar senha"
      subtitle="Enviaremos um link para redefinir o acesso."
    >
      <form className="space-y-4" onSubmit={onSubmit} noValidate>
        <Field
          label="E-mail"
          type="email"
          autoComplete="email"
          placeholder="voce@empresa.com"
          error={errors.email?.message}
          {...register("email")}
        />

        {formError ? <p className="text-sm text-danger">{formError}</p> : null}
        {success ? <p className="text-sm text-success">{success}</p> : null}
        {devResetUrl ? (
          <p className="rounded-(--radius-md) border border-border bg-bg p-3 text-xs text-muted">
            Dev:{" "}
            <a href={devResetUrl} className="break-all text-accent">
              abrir link de reset
            </a>
          </p>
        ) : null}

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Enviando…" : "Enviar link"}
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
