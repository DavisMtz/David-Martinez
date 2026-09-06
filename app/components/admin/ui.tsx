import type { ReactNode } from "react";
import { Link } from "react-router";
import { cx } from "~/lib/utils";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6 mb-8">
      <div>
        {eyebrow && <p className="admin-eyebrow">{eyebrow}</p>}
        <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-sm text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </header>
  );
}

export function Card({ children, className, title, description }: { children: ReactNode; className?: string; title?: string; description?: string }) {
  return (
    <section className={cx("admin-card", className)}>
      {(title || description) && (
        <div className="mb-5">
          {title && <h2 className="font-display text-lg font-semibold">{title}</h2>}
          {description && <p className="mt-1 text-sm text-muted">{description}</p>}
        </div>
      )}
      {children}
    </section>
  );
}

export function Field({
  label,
  help,
  children,
  htmlFor,
  className,
}: {
  label: string;
  help?: string;
  children: ReactNode;
  htmlFor?: string;
  className?: string;
}) {
  return (
    <div className={cx("flex flex-col gap-1.5", className)}>
      <label htmlFor={htmlFor} className="admin-label">
        {label}
      </label>
      {children}
      {help && <p className="text-xs text-muted/80 leading-relaxed">{help}</p>}
    </div>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cx("admin-input", props.className)} />;
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cx("admin-input min-h-28 leading-relaxed", props.className)} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={cx("admin-input", props.className)} />;
}

export function Toggle({ name, label, defaultChecked, help }: { name: string; label: string; defaultChecked?: boolean; help?: string }) {
  return (
    <label className="flex items-start gap-3 cursor-pointer select-none">
      <input type="hidden" name={name} value="0" />
      <input type="checkbox" name={name} value="1" defaultChecked={defaultChecked} className="admin-checkbox mt-0.5" />
      <span>
        <span className="text-sm font-medium">{label}</span>
        {help && <span className="block text-xs text-muted">{help}</span>}
      </span>
    </label>
  );
}

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md";
};

export function Button({ variant = "primary", size = "md", className, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={cx(
        "admin-btn",
        variant === "primary" && "admin-btn-primary",
        variant === "ghost" && "admin-btn-ghost",
        variant === "danger" && "admin-btn-danger",
        variant === "outline" && "admin-btn-outline",
        size === "sm" && "admin-btn-sm",
        className,
      )}
    />
  );
}

export function LinkButton({
  to,
  children,
  variant = "outline",
  size = "md",
  className,
}: {
  to: string;
  children: ReactNode;
  variant?: "primary" | "ghost" | "outline";
  size?: "sm" | "md";
  className?: string;
}) {
  return (
    <Link
      to={to}
      className={cx(
        "admin-btn",
        variant === "primary" && "admin-btn-primary",
        variant === "ghost" && "admin-btn-ghost",
        variant === "outline" && "admin-btn-outline",
        size === "sm" && "admin-btn-sm",
        className,
      )}
    >
      {children}
    </Link>
  );
}

export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "accent" | "success" | "warn" }) {
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.15em]",
        tone === "neutral" && "bg-white/5 text-muted",
        tone === "accent" && "bg-accent/15 text-accent",
        tone === "success" && "bg-accent-3/15 text-accent-3",
        tone === "warn" && "bg-amber-400/15 text-amber-300",
      )}
    >
      {children}
    </span>
  );
}

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-line p-10 text-center">
      <p className="font-display text-lg font-semibold">{title}</p>
      {description && <p className="mt-2 text-sm text-muted">{description}</p>}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}

export function Notice({ kind = "info", children }: { kind?: "info" | "error" | "success"; children: ReactNode }) {
  return (
    <div
      role={kind === "error" ? "alert" : "status"}
      className={cx(
        "rounded-lg border px-4 py-3 text-sm",
        kind === "info" && "border-line bg-white/5",
        kind === "error" && "border-accent/40 bg-accent/10 text-accent",
        kind === "success" && "border-accent-3/40 bg-accent-3/10 text-accent-3",
      )}
    >
      {children}
    </div>
  );
}
