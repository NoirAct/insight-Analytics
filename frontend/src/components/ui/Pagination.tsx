import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/utils/cn";

export function Pagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  return (
    <div className="flex items-center justify-end gap-2">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className={cn(
          "inline-flex items-center gap-1 rounded-(--radius-md) border border-border px-3 py-1.5 text-sm text-muted transition",
          "hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40",
        )}
      >
        <ChevronLeft className="size-4" />
        Anterior
      </button>
      <span className="font-mono text-xs text-muted">
        {page} / {totalPages}
      </span>
      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        className={cn(
          "inline-flex items-center gap-1 rounded-(--radius-md) border border-border px-3 py-1.5 text-sm text-muted transition",
          "hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40",
        )}
      >
        Próxima
        <ChevronRight className="size-4" />
      </button>
    </div>
  );
}
