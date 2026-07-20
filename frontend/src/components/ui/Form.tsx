import { Eye, EyeOff } from "lucide-react";
import {
  forwardRef,
  useState,
  type InputHTMLAttributes,
  type ButtonHTMLAttributes,
} from "react";
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

type PasswordFieldProps = Omit<FieldProps, "type">;

export const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(
  function PasswordField({ label, error, className, id, ...props }, ref) {
    const [visible, setVisible] = useState(false);
    const fieldId = id ?? props.name;

    return (
      <div className="block space-y-1.5">
        <label htmlFor={fieldId} className="text-sm font-medium text-foreground/90">
          {label}
        </label>
        <div className="relative">
          <input
            ref={ref}
            id={fieldId}
            type={visible ? "text" : "password"}
            className={cn(
              "w-full rounded-(--radius-md) border border-border bg-bg px-3.5 py-2.5 pr-11 text-sm text-foreground outline-none transition",
              "placeholder:text-muted/70 focus:border-accent/50 focus:ring-2 focus:ring-accent/20",
              error && "border-danger/60 focus:border-danger/60 focus:ring-danger/20",
              className,
            )}
            {...props}
          />
          <button
            type="button"
            onClick={() => setVisible((value) => !value)}
            className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded-md p-1.5 text-muted transition hover:text-foreground"
            aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
          >
            {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
        {error ? <span className="text-xs text-danger">{error}</span> : null}
      </div>
    );
  },
);

export function Button({
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "inline-flex w-full cursor-pointer items-center justify-center rounded-(--radius-md) bg-accent px-4 py-2.5 text-sm font-semibold text-bg transition",
        "hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}
