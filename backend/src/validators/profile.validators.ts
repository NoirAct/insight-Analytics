import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2).optional(),
  email: z.email().optional(),
  theme: z.enum(["dark", "light"]).optional(),
  locale: z.enum(["pt-BR", "en-US"]).optional(),
  currentPassword: z.string().optional(),
  newPassword: z.union([
    z
      .string()
      .min(8)
      .regex(/[A-Za-z]/)
      .regex(/[0-9]/),
    z.literal(""),
  ]).optional(),
});

export const updateCompanySchema = z.object({
  name: z.string().trim().min(2).optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;
