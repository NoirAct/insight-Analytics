import { z } from "zod";

export const userFormSchema = z
  .object({
    name: z.string().trim().min(2, "Nome muito curto"),
    email: z.email("E-mail inválido"),
    password: z.string().optional(),
    status: z.enum(["ACTIVE", "INACTIVE", "INVITED"]),
    roleId: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.password && data.password.length > 0) {
      if (data.password.length < 8) {
        ctx.addIssue({
          code: "custom",
          path: ["password"],
          message: "Mínimo de 8 caracteres",
        });
      }
      if (!/[A-Za-z]/.test(data.password) || !/[0-9]/.test(data.password)) {
        ctx.addIssue({
          code: "custom",
          path: ["password"],
          message: "Use letras e números",
        });
      }
    }
  });

export type UserFormValues = z.infer<typeof userFormSchema>;
