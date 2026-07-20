import type { ButtonHTMLAttributes, InputHTMLAttributes } from "react";
import { cn } from "@/utils/cn";

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export function Field({ label, error, className, id, ...props }: FieldProps) {
  const fieldId = id ?? props.name;

  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-foreground/90">{label}</span>
      <input
        id={fieldId}
        className={cn(
          "w-full rounded-(--radius-md) border border-border bg-bg px-3.5 py-2.5 text-sm text-foreground outline-none transition",
          "placeholder:text-muted/70 focus:border-accent/50 focus:ring-2 focus:ring-accent/20",
          error && "border-danger/60 focus:border-danger/60 focus:ring-danger/20",
          className,
        )}
        {...props}
      />
      {error ? <span className="text-xs text-danger">{error}</span> : null}
    </label>
  );
}

export function Button({
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "inline-flex w-full items-center justify-center rounded-(--radius-md) bg-accent px-4 py-2.5 text-sm font-semibold text-bg transition",
        "hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}
