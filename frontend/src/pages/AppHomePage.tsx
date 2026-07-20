import { motion } from "framer-motion";
import { LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export function AppHomePage() {
  const { user, logout } = useAuth();

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-3xl flex-col justify-center px-6 py-16">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="glass rounded-(--radius-lg) p-8"
      >
        <p className="text-sm font-medium tracking-[0.16em] text-muted uppercase">
          Insight Analytics
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          Olá, {user?.name}
        </h1>
        <p className="mt-2 text-muted">
          Autenticação pronta. O layout do app chega na próxima etapa.
        </p>
        <p className="mt-4 font-mono text-sm text-accent">{user?.email}</p>

        <button
          type="button"
          onClick={() => void logout()}
          className="mt-8 inline-flex items-center gap-2 rounded-(--radius-md) border border-border px-4 py-2.5 text-sm text-muted transition hover:border-accent/40 hover:text-foreground"
        >
          <LogOut className="size-4" />
          Sair
        </button>
      </motion.div>
    </main>
  );
}
