export type ProductStatus = "ACTIVE" | "DRAFT" | "ARCHIVED";

export type ProductCategory = {
  id: string;
  name: string;
  slug: string;
  productsCount?: number;
};

export type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  status: ProductStatus;
  imageUrl: string | null;
  categoryId: string | null;
  category: Omit<ProductCategory, "productsCount"> | null;
  createdAt: string;
  updatedAt: string;
};

export type ProductsListResponse = {
  data: Product[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

export type ProductsQuery = {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: ProductStatus | "";
  categoryId?: string;
};
