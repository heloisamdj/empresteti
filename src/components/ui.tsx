"use client";
// Button: padrão shadcn/ui (MIT), adaptado aos tokens e variantes do ADR-002.
import { Slot } from "@radix-ui/react-slot";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cva } from "class-variance-authority";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { ButtonHTMLAttributes, ReactNode } from "react";
export function cn(...values: ClassValue[]) {
  return twMerge(clsx(values));
}
const variants = cva(
  "action-button inline-flex min-h-9 shrink-0 items-center justify-center gap-2 rounded-lg border bg-transparent px-4 py-2 text-[13px] font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-500)] disabled:cursor-not-allowed disabled:opacity-45",
  {
    variants: {
      variant: {
        primary:
          "border-[var(--accent-500)] text-[var(--accent-300)] hover:bg-[var(--accent-800)] hover:text-[var(--accent-100)]",
        confirmation:
          "border-[var(--accent-500)] bg-[var(--accent-800)] text-[var(--accent-200)]",
        secondary:
          "border-[var(--border-strong)] text-[var(--text-dim)] hover:text-[var(--color-text)]",
        row: "border-[var(--border-strong)] text-[var(--accent-200)] hover:border-[var(--accent-500)]",
        late: "border-[var(--accent-500)] bg-[var(--accent-800)] text-[var(--accent-200)]",
      },
    },
    defaultVariants: { variant: "primary" },
  },
);
export function Button({
  className,
  variant = "primary",
  asChild = false,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
  variant?: "primary" | "confirmation" | "secondary" | "row" | "late";
}) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(variants({ variant }), className)} {...props} />;
}
export const fieldClass =
  "min-h-[42px] w-full rounded-lg border border-[var(--border-strong)] bg-[var(--surface-sunken)] px-3 py-2 text-sm text-[var(--color-text)] placeholder:text-[var(--text-faint)]";
export const panelClass =
  "rounded-xl border border-[var(--border-card)] bg-[var(--color-surface)] p-5";
export function Icon({
  name,
  className,
  weight = "regular",
}: {
  name: string;
  className?: string;
  weight?: "regular" | "fill";
}) {
  return (
    <i
      aria-hidden="true"
      className={cn(
        `${weight === "fill" ? "ph-fill" : "ph"} ph-${name}`,
        className,
      )}
    />
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
    available:
      "border-emerald-400/30 bg-emerald-400/10 text-[var(--status-available)]",
    borrowed:
      "border-[var(--border-strong)] bg-[var(--border-soft)] text-[var(--text-dim)]",
    maintenance:
      "border-amber-400/30 bg-amber-400/10 text-[var(--status-maintenance)]",
    late: "border-rose-400/30 bg-rose-400/10 text-[var(--status-late)]",
  };
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold",
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}
export function Notice({
  children,
  error = false,
}: {
  children: ReactNode;
  error?: boolean;
}) {
  return (
    <div
      role={error ? "alert" : "status"}
      className={cn(
        "flex items-start gap-3 rounded-[10px] border p-4 text-[13px] leading-relaxed",
        error
          ? "border-rose-400/30 bg-rose-400/5 text-[var(--status-late)]"
          : "border-[var(--accent-700)] bg-[var(--surface-sunken)] text-[var(--text-muted)]",
      )}
    >
      <Icon
        name={error ? "warning-circle" : "info"}
        className="mt-0.5 text-lg"
      />
      <div>{children}</div>
    </div>
  );
}
export function ScreenTitle({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-[-0.01em]">{title}</h1>
        {description && (
          <p className="text-[13px] text-[var(--text-muted)]">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
export function Loading() {
  return (
    <p role="status" className="p-6 text-sm text-[var(--text-muted)]">
      Carregando…
    </p>
  );
}
export function Empty({ children }: { children: ReactNode }) {
  return (
    <div className="col-span-full rounded-xl border border-dashed border-[var(--border-strong)] p-7 text-center text-sm text-[var(--text-muted)]">
      {children}
    </div>
  );
}
export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
}: {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="dialog-overlay fixed inset-0 z-40 bg-[#04060e]/80" />
        <DialogPrimitive.Content
          className={cn(
            panelClass,
            "dialog-content fixed left-1/2 top-1/2 z-50 flex w-[calc(100%-32px)] max-w-[432px] -translate-x-1/2 -translate-y-1/2 flex-col gap-4 p-6 shadow-xl",
          )}
        >
          <DialogPrimitive.Title className="text-[19px] font-semibold">
            {title}
          </DialogPrimitive.Title>
          <DialogPrimitive.Description className="text-[13px] leading-relaxed text-[var(--text-muted)]">
            {description}
          </DialogPrimitive.Description>
          {children}
          <DialogPrimitive.Close asChild>
            <Button variant="secondary">Cancelar</Button>
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
