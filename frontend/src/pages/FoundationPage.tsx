import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Activity, Database, Server } from "lucide-react";
import { api } from "@/api/client";
import { cn } from "@/utils/cn";

type HealthResponse = {
  status: string;
  service: string;
  timestamp: string;
};

export function FoundationPage() {
  const health = useQuery({
    queryKey: ["health"],
    queryFn: async () => {
      const { data } = await api.get<HealthResponse>("/health");
      return data;
    },
    retry: false,
  });

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-5xl flex-col justify-center px-6 py-16">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="glass rounded-(--radius-lg) p-8 md:p-10"
      >
        <p className="mb-3 text-sm font-medium tracking-[0.18em] text-muted uppercase">
          Insight Analytics
        </p>
        <h1 className="max-w-2xl text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
          Fundação pronta para o SaaS
        </h1>
        <p className="mt-3 max-w-xl text-muted">
          Frontend, API, Prisma e Docker configurados. Próxima etapa: autenticação.
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <StatusCard
            icon={<Activity className="size-4" />}
            label="Frontend"
            value="Vite + React"
            ok
          />
          <StatusCard
            icon={<Server className="size-4" />}
            label="API"
            value={
              health.isLoading
                ? "Checando…"
                : health.isSuccess
                  ? "Online"
                  : "Offline"
            }
            ok={health.isSuccess}
          />
          <StatusCard
            icon={<Database className="size-4" />}
            label="Stack"
            value="Postgres + Redis"
            ok
          />
        </div>
      </motion.div>
    </main>
  );
}

function StatusCard({
  icon,
  label,
  value,
  ok,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  ok: boolean;
}) {
  return (
    <div className="rounded-(--radius-md) border border-border bg-surface p-4">
      <div className="mb-3 flex items-center gap-2 text-muted">
        {icon}
        <span className="text-xs font-medium tracking-wide uppercase">{label}</span>
      </div>
      <p className={cn("font-mono text-sm", ok ? "text-success" : "text-danger")}>
        {value}
      </p>
    </div>
  );
}
