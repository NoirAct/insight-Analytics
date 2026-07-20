import { z } from "zod";

export const productStatusSchema = z.enum(["ACTIVE", "DRAFT", "ARCHIVED"]);

export const listProductsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10),
  search: z.string().trim().optional().default(""),
  status: z
    .string()
    .optional()
    .transform((value) =>
      value === "ACTIVE" || value === "DRAFT" || value === "ARCHIVED"
        ? value
        : undefined,
    ),
  categoryId: z
    .string()
    .optional()
    .transform((value) => (value ? value : undefined)),
});

export const createProductSchema = z.object({
  name: z.string().trim().min(2, "Nome deve ter ao menos 2 caracteres"),
  description: z.string().trim().optional().nullable(),
  price: z.coerce.number().positive("Preço deve ser maior que zero"),
  stock: z.coerce.number().int().min(0, "Estoque inválido").default(0),
  status: productStatusSchema.default("DRAFT"),
  categoryId: z.string().nullable().optional(),
});

export const updateProductSchema = z.object({
  name: z.string().trim().min(2).optional(),
  description: z.string().trim().optional().nullable(),
  price: z.coerce.number().positive().optional(),
  stock: z.coerce.number().int().min(0).optional(),
  status: productStatusSchema.optional(),
  categoryId: z.string().nullable().optional(),
});

export const createCategorySchema = z.object({
  name: z.string().trim().min(2, "Nome da categoria inválido"),
});

export type ListProductsInput = z.infer<typeof listProductsSchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
