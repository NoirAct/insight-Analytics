import { PackagePlus } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";

export function ProductsPage() {
  return (
    <div>
      <PageHeader
        title="Produtos"
        description="CRUD de produtos e categorias na etapa 6."
        actions={
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-(--radius-md) bg-accent px-3.5 py-2 text-sm font-semibold text-bg"
          >
            <PackagePlus className="size-4" />
            Novo produto
          </button>
        }
      />
      <EmptyState
        title="Catálogo vazio"
        description="Preço, estoque, status e imagem serão gerenciados aqui."
      />
    </div>
  );
}
