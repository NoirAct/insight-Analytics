import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("E-mail inválido"),
  password: z.string().min(1, "Informe a senha"),
  rememberMe: z.boolean().optional(),
});

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Nome muito curto"),
    email: z.email("E-mail inválido"),
    password: z
      .string()
      .min(8, "Mínimo de 8 caracteres")
      .regex(/[A-Za-z]/, "Inclua letras")
      .regex(/[0-9]/, "Inclua números"),
    confirmPassword: z.string().min(1, "Confirme a senha"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: z.email("E-mail inválido"),
});

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Mínimo de 8 caracteres")
      .regex(/[A-Za-z]/, "Inclua letras")
      .regex(/[0-9]/, "Inclua números"),
    confirmPassword: z.string().min(1, "Confirme a senha"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
