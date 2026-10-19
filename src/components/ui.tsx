import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "row";

const buttonVariants: Record<ButtonVariant, string> = {
  primary:
    "border-[var(--accent-500)] text-[var(--accent-300)] hover:border-[var(--accent-400)] hover:bg-[rgba(91,127,224,0.12)] hover:text-[var(--accent-100)]",
  secondary:
    "border-[var(--border-strong)] text-[var(--text-dim)] hover:border-[var(--text-ghost)] hover:text-[var(--color-text)]",
  row:
    "border-[var(--border-strong)] text-[var(--accent-200)] hover:border-[var(--accent-500)] hover:bg-[rgba(91,127,224,0.1)]",
};

export function Button({
  children,
  className = "",
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: ButtonVariant;
}) {
  return (
    <button
      className={`inline-flex h-9 items-center justify-center gap-2 rounded-lg border bg-transparent px-4 text-[13px] font-semibold transition-[background,border-color,color] duration-[140ms] ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-500)] disabled:cursor-not-allowed disabled:opacity-45 ${buttonVariants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function StatusPill({
  children,
  tone = "available",
}: {
  children: ReactNode;
  tone?: "available" | "borrowed" | "maintenance" | "late";
}) {
  const tones = {
    available: "border-[rgba(63,185,140,0.35)] bg-[rgba(63,185,140,0.12)] text-[var(--status-available)]",
    borrowed: "border-[var(--border-strong)] bg-[var(--border-soft)] text-[var(--text-dim)]",
    maintenance: "border-[rgba(224,163,63,0.35)] bg-[rgba(224,163,63,0.12)] text-[var(--status-maintenance)]",
    late: "border-[rgba(224,91,98,0.4)] bg-[rgba(224,91,98,0.05)] text-[var(--status-late)]",
  };

  return <span className={`inline-flex rounded-full border px-[9px] py-[3px] text-[11px] font-semibold ${tones[tone]}`}>{children}</span>;
}
