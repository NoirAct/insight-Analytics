import { Link } from "react-router-dom";
import type { ReactNode } from "react";

export function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <main className="relative mx-auto flex min-h-svh w-full max-w-md flex-col justify-center px-6 py-12">
      <div className="mb-8">
        <Link
          to="/"
          className="text-sm font-semibold tracking-[0.16em] text-muted uppercase transition hover:text-foreground"
        >
          Insight Analytics
        </Link>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground">
          {title}
        </h1>
        <p className="mt-2 text-sm text-muted">{subtitle}</p>
      </div>

      <div className="glass rounded-(--radius-lg) p-6 md:p-7">{children}</div>
    </main>
  );
}
