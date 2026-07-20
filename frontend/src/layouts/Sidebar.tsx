import { Link, NavLink } from "react-router-dom";
import { X } from "lucide-react";
import { mainNav } from "@/layouts/nav";
import { cn } from "@/utils/cn";

export function Sidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/50 transition md:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
        aria-hidden={!open}
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-surface transition-transform duration-300 md:static md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-14 items-center justify-between border-b border-border px-4">
          <Link
            to="/app/dashboard"
            onClick={onClose}
            className="flex items-center gap-2.5 transition hover:opacity-90"
          >
            <span className="flex size-7 items-center justify-center rounded-md bg-accent-soft font-mono text-xs font-semibold text-accent">
              IA
            </span>
            <span className="text-sm font-semibold tracking-tight">
              Insight Analytics
            </span>
          </Link>
          <button
            type="button"
            className="rounded-md p-1.5 text-muted transition hover:bg-border/50 hover:text-foreground md:hidden"
            onClick={onClose}
            aria-label="Fechar menu"
          >
            <X className="size-4" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          <p className="px-2.5 pb-2 text-[11px] font-medium tracking-[0.14em] text-muted uppercase">
            Menu
          </p>
          {mainNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  "group flex items-center gap-2.5 rounded-(--radius-md) px-2.5 py-2 text-sm transition",
                  isActive
                    ? "bg-accent-soft text-accent"
                    : "text-muted hover:bg-border/40 hover:text-foreground",
                )
              }
            >
              <item.icon className="size-4 shrink-0 opacity-90" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-border p-3">
          <p className="px-2.5 text-[11px] text-muted">
            SaaS premium · etapa 3
          </p>
        </div>
      </aside>
    </>
  );
}
