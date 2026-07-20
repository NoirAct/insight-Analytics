import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { Button, Field } from "@/components/ui/Form";
import { useAuth } from "@/contexts/AuthContext";
import { AuthLayout } from "@/layouts/AuthLayout";
import { registerSchema, type RegisterFormValues } from "@/schemas/auth";

export function RegisterPage() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await registerUser({
        name: values.name,
        email: values.email,
        password: values.password,
      });
      navigate("/app/dashboard", { replace: true });
    } catch (error) {
      if (isAxiosError(error)) {
        setFormError(error.response?.data?.error ?? "Falha no cadastro");
        return;
      }
      setFormError("Falha no cadastro");
    }
  });

  return (
    <AuthLayout title="Criar conta" subtitle="Comece a monitorar seus indicadores.">
      <form className="space-y-4" onSubmit={onSubmit} noValidate>
        <Field
          label="Nome"
          autoComplete="name"
          placeholder="Seu nome"
          error={errors.name?.message}
          {...register("name")}
        />
        <Field
          label="E-mail"
          type="email"
          autoComplete="email"
          placeholder="voce@empresa.com"
          error={errors.email?.message}
          {...register("email")}
        />
        <Field
          label="Senha"
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

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Criando…" : "Criar conta"}
        </Button>
      </form>

      <p className="mt-5 text-center text-sm text-muted">
        Já tem conta?{" "}
        <Link to="/login" className="text-accent hover:brightness-110">
          Entrar
        </Link>
      </p>
    </AuthLayout>
  );
}
