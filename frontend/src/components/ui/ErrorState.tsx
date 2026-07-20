import { AlertTriangle } from "lucide-react";

export function ErrorState({
  title = "Algo deu errado",
  description = "Não foi possível carregar estes dados. Tente novamente.",
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-(--radius-lg) border border-danger/25 bg-surface/40 px-6 py-16 text-center">
      <div className="mb-4 flex size-11 items-center justify-center rounded-full bg-danger/10 text-danger">
        <AlertTriangle className="size-5" />
      </div>
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted">{description}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 rounded-(--radius-md) border border-border px-4 py-2 text-sm text-foreground transition hover:border-accent/40 hover:text-accent"
        >
          Tentar novamente
        </button>
      ) : null}
    </div>
  );
}
