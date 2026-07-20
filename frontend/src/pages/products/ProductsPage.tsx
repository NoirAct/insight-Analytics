import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PackagePlus, Pencil, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { ProductFormModal } from "@/components/products/ProductFormModal";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { PageHeader } from "@/components/ui/PageHeader";
import { Pagination } from "@/components/ui/Pagination";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/contexts/ToastContext";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import type { ProductFormValues } from "@/schemas/products";
import { productsApi } from "@/services/products.service";
import type { Product, ProductStatus } from "@/types/products";
import { cn } from "@/utils/cn";
import { formatCurrency, formatNumber } from "@/utils/format";

const STATUS_LABEL: Record<ProductStatus, string> = {
  ACTIVE: "Ativo",
  DRAFT: "Rascunho",
  ARCHIVED: "Arquivado",
};

export function ProductsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ProductStatus | "">("");
  const [categoryId, setCategoryId] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);

  const debouncedSearch = useDebouncedValue(search, 350);

  const queryKey = useMemo(
    () => ["products", { page, search: debouncedSearch, status, categoryId }],
    [page, debouncedSearch, status, categoryId],
  );

  const productsQuery = useQuery({
    queryKey,
    queryFn: async () => {
      const { data } = await productsApi.list({
        page,
        pageSize: 10,
        search: debouncedSearch || undefined,
        status: status || undefined,
        categoryId: categoryId || undefined,
      });
      return data;
    },
  });

  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await productsApi.getCategories();
      return data.categories;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async ({
      values,
      imageFile,
      productId,
    }: {
      values: ProductFormValues;
      imageFile: File | null;
      productId?: string;
    }) => {
      const payload = {
        name: values.name,
        description: values.description || null,
        price: values.price,
        stock: values.stock,
        status: values.status,
        categoryId: values.categoryId || null,
      };

      let saved: Product;
      if (productId) {
        const { data } = await productsApi.update(productId, payload);
        saved = data.product;
      } else {
        const { data } = await productsApi.create(payload);
        saved = data.product;
      }

      if (imageFile) {
        const { data } = await productsApi.uploadImage(saved.id, imageFile);
        saved = data.product;
      }

      return saved;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["products"] });
      void queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast({
        title: editing ? "Produto atualizado" : "Produto criado",
        tone: "success",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => productsApi.remove(id),
    onSuccess: (response) => {
      void queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({
        title: response.data.archived
          ? "Produto arquivado (possui pedidos)"
          : "Produto removido",
        tone: "info",
      });
    },
    onError: (error: unknown) => {
      const message =
        (error as { response?: { data?: { error?: string } } })?.response?.data
          ?.error ?? "Falha ao remover";
      toast({ title: message, tone: "error" });
    },
  });

  const createCategoryMutation = useMutation({
    mutationFn: (name: string) => productsApi.createCategory(name),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast({ title: "Categoria criada", tone: "success" });
    },
  });

  const categories = categoriesQuery.data ?? [];
  const products = productsQuery.data?.data ?? [];
  const meta = productsQuery.data?.meta;

  return (
    <div>
      <PageHeader
        title="Produtos"
        description="CRUD com categorias, preço, estoque, status e imagem."
        actions={
          <button
            type="button"
            onClick={() => {
              setEditing(null);
              setModalOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-(--radius-md) bg-accent px-3.5 py-2 text-sm font-semibold text-bg transition hover:brightness-110"
          >
            <PackagePlus className="size-4" />
            Novo produto
          </button>
        }
      />

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" />
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Buscar por nome ou descrição"
            className="w-full rounded-(--radius-md) border border-border bg-surface py-2.5 pr-3 pl-10 text-sm outline-none focus:border-accent/40"
          />
        </div>

        <select
          value={status}
          onChange={(event) => {
            setStatus(event.target.value as ProductStatus | "");
            setPage(1);
          }}
          className="rounded-(--radius-md) border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-accent/40"
        >
          <option value="">Todos os status</option>
          <option value="ACTIVE">Ativo</option>
          <option value="DRAFT">Rascunho</option>
          <option value="ARCHIVED">Arquivado</option>
        </select>

        <select
          value={categoryId}
          onChange={(event) => {
            setCategoryId(event.target.value);
            setPage(1);
          }}
          className="rounded-(--radius-md) border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-accent/40"
        >
          <option value="">Todas as categorias</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {productsQuery.isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-14 w-full" />
          ))}
        </div>
      ) : productsQuery.isError ? (
        <ErrorState onRetry={() => void productsQuery.refetch()} />
      ) : products.length === 0 ? (
        <EmptyState
          title="Nenhum produto encontrado"
          description="Ajuste os filtros ou cadastre um novo produto."
        />
      ) : (
        <div className="overflow-hidden rounded-(--radius-lg) border border-border bg-surface">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-border text-xs tracking-wide text-muted uppercase">
                <tr>
                  <th className="px-4 py-3 font-medium">Produto</th>
                  <th className="px-4 py-3 font-medium">Categoria</th>
                  <th className="px-4 py-3 font-medium">Preço</th>
                  <th className="px-4 py-3 font-medium">Estoque</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr
                    key={product.id}
                    className="border-b border-border/70 last:border-0 hover:bg-border/20"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center overflow-hidden rounded-(--radius-md) border border-border bg-bg">
                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt=""
                              className="size-full object-cover"
                            />
                          ) : (
                            <span className="text-[10px] text-muted">IMG</span>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{product.name}</p>
                          <p className="line-clamp-1 max-w-64 text-xs text-muted">
                            {product.description || "Sem descrição"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {product.category?.name ?? "—"}
                    </td>
                    <td className="px-4 py-3 font-mono">
                      {formatCurrency(product.price)}
                    </td>
                    <td className="px-4 py-3 font-mono">
                      {formatNumber(product.stock)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                          product.status === "ACTIVE" && "bg-success/15 text-success",
                          product.status === "DRAFT" && "bg-warning/15 text-warning",
                          product.status === "ARCHIVED" && "bg-danger/15 text-danger",
                        )}
                      >
                        {STATUS_LABEL[product.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setEditing(product);
                            setModalOpen(true);
                          }}
                          className="rounded-md p-2 text-muted transition hover:bg-border/40 hover:text-foreground"
                          aria-label="Editar"
                        >
                          <Pencil className="size-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Remover ${product.name}?`)) {
                              deleteMutation.mutate(product.id);
                            }
                          }}
                          className="rounded-md p-2 text-muted transition hover:bg-danger/10 hover:text-danger"
                          aria-label="Remover"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {meta ? (
            <div className="flex items-center justify-between border-t border-border px-4 py-3">
              <p className="text-xs text-muted">
                {meta.total} produto{meta.total === 1 ? "" : "s"}
              </p>
              <Pagination
                page={meta.page}
                totalPages={meta.totalPages}
                onPageChange={setPage}
              />
            </div>
          ) : null}
        </div>
      )}

      <ProductFormModal
        open={modalOpen}
        mode={editing ? "edit" : "create"}
        product={editing}
        categories={categories}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        onCreateCategory={async (name) => {
          await createCategoryMutation.mutateAsync(name);
        }}
        onSubmit={async (values, imageFile) => {
          await saveMutation.mutateAsync({
            values,
            imageFile,
            productId: editing?.id,
          });
        }}
      />
    </div>
  );
}
