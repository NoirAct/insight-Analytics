import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Nome deve ter ao menos 2 caracteres"),
  email: z.email("E-mail inválido"),
  password: z
    .string()
    .min(8, "Senha deve ter ao menos 8 caracteres")
    .regex(/[A-Za-z]/, "Senha deve conter letras")
    .regex(/[0-9]/, "Senha deve conter números"),
});

export const loginSchema = z.object({
  email: z.email("E-mail inválido"),
  password: z.string().min(1, "Senha obrigatória"),
  rememberMe: z.boolean().optional().default(false),
});

export const forgotPasswordSchema = z.object({
  email: z.email("E-mail inválido"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token obrigatório"),
  password: z
    .string()
    .min(8, "Senha deve ter ao menos 8 caracteres")
    .regex(/[A-Za-z]/, "Senha deve conter letras")
    .regex(/[0-9]/, "Senha deve conter números"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
