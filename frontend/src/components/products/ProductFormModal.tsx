import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { ImagePlus, X } from "lucide-react";
import { Button, Field } from "@/components/ui/Form";
import { productFormSchema, type ProductFormValues } from "@/schemas/products";
import type { Product, ProductCategory } from "@/types/products";

export function ProductFormModal({
  open,
  mode,
  product,
  categories,
  onClose,
  onSubmit,
  onCreateCategory,
}: {
  open: boolean;
  mode: "create" | "edit";
  product?: Product | null;
  categories: ProductCategory[];
  onClose: () => void;
  onSubmit: (values: ProductFormValues, imageFile: File | null) => Promise<void>;
  onCreateCategory: (name: string) => Promise<void>;
}) {
  const [formError, setFormError] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState("");
  const [creatingCategory, setCreatingCategory] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      stock: 0,
      status: "DRAFT",
      categoryId: "",
    },
  });

  useEffect(() => {
    if (!open) return;
    setFormError(null);
    setImageFile(null);
    setNewCategory("");
    setPreview(product?.imageUrl ?? null);
    reset({
      name: product?.name ?? "",
      description: product?.description ?? "",
      price: product?.price ?? 0,
      stock: product?.stock ?? 0,
      status: product?.status ?? "DRAFT",
      categoryId: product?.category?.id ?? "",
    });
  }, [open, product, reset]);

  if (!open) return null;

  const submit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await onSubmit(values, imageFile);
      onClose();
    } catch (error) {
      if (isAxiosError(error)) {
        setFormError(error.response?.data?.error ?? "Não foi possível salvar");
        return;
      }
      setFormError("Não foi possível salvar");
    }
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/60"
        aria-label="Fechar"
        onClick={onClose}
      />
      <div className="relative z-10 max-h-[90svh] w-full max-w-lg overflow-y-auto rounded-(--radius-lg) border border-border bg-surface p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {mode === "create" ? "Novo produto" : "Editar produto"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-muted transition hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        <form className="space-y-3" onSubmit={submit} noValidate>
          <div className="flex items-center gap-3">
            <div className="flex size-16 items-center justify-center overflow-hidden rounded-(--radius-md) border border-border bg-bg">
              {preview ? (
                <img src={preview} alt="" className="size-full object-cover" />
              ) : (
                <ImagePlus className="size-5 text-muted" />
              )}
            </div>
            <label className="cursor-pointer text-sm text-accent hover:brightness-110">
              Alterar imagem
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0] ?? null;
                  setImageFile(file);
                  if (file) setPreview(URL.createObjectURL(file));
                }}
              />
            </label>
          </div>

          <Field label="Nome" error={errors.name?.message} {...register("name")} />
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-foreground/90">Descrição</span>
            <textarea
              rows={3}
              className="w-full rounded-(--radius-md) border border-border bg-bg px-3.5 py-2.5 text-sm outline-none focus:border-accent/50"
              {...register("description")}
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Preço"
              type="number"
              step="0.01"
              min="0"
              error={errors.price?.message}
              {...register("price", { valueAsNumber: true })}
            />
            <Field
              label="Estoque"
              type="number"
              min="0"
              error={errors.stock?.message}
              {...register("stock", { valueAsNumber: true })}
            />
          </div>

          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-foreground/90">Status</span>
            <select
              className="w-full cursor-pointer rounded-(--radius-md) border border-border bg-bg px-3.5 py-2.5 text-sm outline-none focus:border-accent/50"
              {...register("status")}
            >
              <option value="ACTIVE">Ativo</option>
              <option value="DRAFT">Rascunho</option>
              <option value="ARCHIVED">Arquivado</option>
            </select>
          </label>

          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-foreground/90">Categoria</span>
            <select
              className="w-full cursor-pointer rounded-(--radius-md) border border-border bg-bg px-3.5 py-2.5 text-sm outline-none focus:border-accent/50"
              {...register("categoryId")}
            >
              <option value="">Sem categoria</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <div className="flex gap-2">
            <input
              value={newCategory}
              onChange={(event) => setNewCategory(event.target.value)}
              placeholder="Nova categoria"
              className="min-w-0 flex-1 rounded-(--radius-md) border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-accent/50"
            />
            <button
              type="button"
              disabled={!newCategory.trim() || creatingCategory}
              onClick={async () => {
                setCreatingCategory(true);
                setFormError(null);
                try {
                  await onCreateCategory(newCategory.trim());
                  setNewCategory("");
                } catch (error) {
                  if (isAxiosError(error)) {
                    setFormError(
                      error.response?.data?.error ?? "Falha ao criar categoria",
                    );
                  } else {
                    setFormError("Falha ao criar categoria");
                  }
                } finally {
                  setCreatingCategory(false);
                }
              }}
              className="rounded-(--radius-md) border border-border px-3 text-sm text-muted transition hover:text-foreground disabled:opacity-50"
            >
              Adicionar
            </button>
          </div>

          {formError ? <p className="text-sm text-danger">{formError}</p> : null}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-(--radius-md) border border-border px-4 py-2.5 text-sm text-muted transition hover:text-foreground"
            >
              Cancelar
            </button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? "Salvando…" : "Salvar"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
