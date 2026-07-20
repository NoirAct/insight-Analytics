import { z } from "zod";

export const productFormSchema = z.object({
  name: z.string().trim().min(2, "Nome muito curto"),
  description: z.string().optional(),
  price: z.number().positive("Preço inválido"),
  stock: z.number().int().min(0, "Estoque inválido"),
  status: z.enum(["ACTIVE", "DRAFT", "ARCHIVED"]),
  categoryId: z.string().optional(),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;
