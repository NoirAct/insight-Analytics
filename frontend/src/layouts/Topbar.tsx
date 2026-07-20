import { Link } from "react-router-dom";
import { LogOut, Menu, Moon, Sun, UserRound } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useToast } from "@/contexts/ToastContext";
import { cn } from "@/utils/cn";

export function Topbar({
  title,
  onMenuClick,
}: {
  title: string;
  onMenuClick: () => void;
}) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-bg/80 px-4 backdrop-blur-md md:px-6">
      <button
        type="button"
        onClick={onMenuClick}
        className="rounded-md p-2 text-muted transition hover:bg-border/50 hover:text-foreground md:hidden"
        aria-label="Abrir menu"
      >
        <Menu className="size-4" />
      </button>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{title}</p>
      </div>

      <button
        type="button"
        onClick={toggleTheme}
        className="rounded-md p-2 text-muted transition hover:bg-border/50 hover:text-foreground"
        aria-label="Alternar tema"
      >
        {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
      </button>

      <Link
        to="/app/profile"
        className={cn(
          "hidden items-center gap-2 rounded-(--radius-md) border border-border bg-surface px-2.5 py-1.5 sm:flex",
          "transition hover:border-accent/40",
        )}
      >
        <span className="flex size-6 items-center justify-center rounded-full bg-accent-soft text-accent">
          <UserRound className="size-3.5" />
        </span>
        <span className="max-w-28 truncate text-xs font-medium">
          {user?.name}
        </span>
      </Link>

      <button
        type="button"
        onClick={() => {
          void logout().then(() =>
            toast({ title: "Sessão encerrada", tone: "info" }),
          );
        }}
        className="rounded-md p-2 text-muted transition hover:bg-border/50 hover:text-foreground"
        aria-label="Sair"
      >
        <LogOut className="size-4" />
      </button>
    </header>
  );
}
