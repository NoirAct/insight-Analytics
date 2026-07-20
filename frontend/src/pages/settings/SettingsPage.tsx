import { PageHeader } from "@/components/ui/PageHeader";
import { useTheme } from "@/contexts/ThemeContext";
import { useToast } from "@/contexts/ToastContext";

export function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  return (
    <div>
      <PageHeader
        title="Configurações"
        description="Empresa, logo, preferências e sessões ativas (etapa 7)."
      />

      <div className="max-w-xl space-y-4">
        <section className="rounded-(--radius-lg) border border-border bg-surface p-5">
          <h2 className="text-sm font-semibold">Aparência</h2>
          <p className="mt-1 text-sm text-muted">
            Alterna entre modo escuro e claro no shell do app.
          </p>
          <div className="mt-4 flex gap-2">
            {(["dark", "light"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  setTheme(option);
                  toast({
                    title: option === "dark" ? "Tema escuro" : "Tema claro",
                    tone: "success",
                  });
                }}
                className={`rounded-(--radius-md) border px-3.5 py-2 text-sm capitalize transition ${
                  theme === option
                    ? "border-accent/50 bg-accent-soft text-accent"
                    : "border-border text-muted hover:text-foreground"
                }`}
              >
                {option === "dark" ? "Escuro" : "Claro"}
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-(--radius-lg) border border-border bg-surface p-5">
          <h2 className="text-sm font-semibold">Empresa</h2>
          <p className="mt-1 text-sm text-muted">
            Nome, logo e preferências serão editáveis na etapa 7.
          </p>
        </section>
      </div>
    </div>
  );
}
