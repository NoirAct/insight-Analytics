import { z } from "zod";

export const userStatusSchema = z.enum(["ACTIVE", "INACTIVE", "INVITED"]);

const passwordSchema = z
  .string()
  .min(8, "Senha deve ter ao menos 8 caracteres")
  .regex(/[A-Za-z]/, "Senha deve conter letras")
  .regex(/[0-9]/, "Senha deve conter números");

export const listUsersSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10),
  search: z.string().trim().optional().default(""),
  status: z
    .string()
    .optional()
    .transform((value) =>
      value === "ACTIVE" || value === "INACTIVE" || value === "INVITED"
        ? value
        : undefined,
    ),
  roleId: z
    .string()
    .optional()
    .transform((value) => (value ? value : undefined)),
});

export const createUserSchema = z.object({
  name: z.string().trim().min(2, "Nome deve ter ao menos 2 caracteres"),
  email: z.email("E-mail inválido"),
  password: passwordSchema,
  status: userStatusSchema.default("ACTIVE"),
  roleId: z.string().nullable().optional(),
});

export const updateUserSchema = z.object({
  name: z.string().trim().min(2).optional(),
  email: z.email().optional(),
  password: z.union([passwordSchema, z.literal("")]).optional(),
  status: userStatusSchema.optional(),
  roleId: z.string().nullable().optional(),
});

export type ListUsersInput = z.infer<typeof listUsersSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
