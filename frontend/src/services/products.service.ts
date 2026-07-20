import { api } from "@/api/client";
import type {
  Product,
  ProductCategory,
  ProductsListResponse,
  ProductsQuery,
} from "@/types/products";

export const productsApi = {
  list(params: ProductsQuery) {
    return api.get<ProductsListResponse>("/products", { params });
  },

  getCategories() {
    return api.get<{ categories: ProductCategory[] }>("/products/categories");
  },

  createCategory(name: string) {
    return api.post<{ category: ProductCategory }>("/products/categories", {
      name,
    });
  },

  create(data: {
    name: string;
    description?: string | null;
    price: number;
    stock: number;
    status: string;
    categoryId?: string | null;
  }) {
    return api.post<{ product: Product }>("/products", data);
  },

  update(
    id: string,
    data: {
      name?: string;
      description?: string | null;
      price?: number;
      stock?: number;
      status?: string;
      categoryId?: string | null;
    },
  ) {
    return api.patch<{ product: Product }>(`/products/${id}`, data);
  },

  remove(id: string) {
    return api.delete<{ ok: boolean; archived: boolean }>(`/products/${id}`);
  },

  uploadImage(id: string, file: File) {
    const form = new FormData();
    form.append("image", file);
    return api.post<{ product: Product }>(`/products/${id}/image`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};
