"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Button } from "./ui";

type NavigationItem = { href: string; icon: string; label: string; badge?: string };

const collaboratorItems: NavigationItem[] = [
  { href: "/catalogo", icon: "ph-squares-four", label: "Catálogo" },
  { href: "/meus-emprestimos", icon: "ph-hand-arrow-down", label: "Meus empréstimos", badge: "2" },
];

const operationsItems: NavigationItem[] = [
  { href: "/operacoes/emprestimos", icon: "ph-list-checks", label: "Empréstimos em aberto" },
  { href: "/operacoes/equipamentos/novo", icon: "ph-plus-square", label: "Cadastrar equipamento" },
];

function NavigationGroup({ label, items }: { label: string; items: NavigationItem[] }) {
  const pathname = usePathname();

  return (
    <section className="flex flex-col gap-[3px]">
      <p className="px-2 pb-[6px] text-[10px] uppercase tracking-[0.12em] text-[var(--text-ghost)]">{label}</p>
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            className={`flex items-center gap-[10px] rounded-lg px-[10px] py-[9px] text-[13px] transition-[background,color] duration-[120ms] ease-out ${active ? "bg-[var(--color-surface)] text-[var(--color-text)] shadow-[inset_2px_0_0_var(--accent-500)]" : "text-[var(--text-dim)] hover:bg-[var(--surface-sunken)] hover:text-[var(--color-text)]"}`}
            href={item.href}
            key={item.href}
          >
            <i className={`${item.icon} ${active ? "ph-fill" : "ph"} text-base text-[var(--accent-400)]`} aria-hidden="true" />
            <span>{item.label}</span>
            {item.badge ? <span className="ml-auto rounded-full bg-[var(--accent-800)] px-[7px] py-px text-[11px] font-semibold text-[var(--accent-300)]">{item.badge}</span> : null}
          </Link>
        );
      })}
    </section>
  );
}

function Sidebar() {
  return (
    <aside className="flex min-h-screen w-[236px] shrink-0 flex-col gap-[26px] border-r border-[var(--border-soft)] bg-[var(--sidebar-bg)] px-[14px] py-[22px]">
      <Link className="flex items-center gap-[10px] px-2" href="/catalogo">
        <span className="flex size-7 items-center justify-center rounded-[7px] bg-[var(--accent-900)] text-[var(--accent-400)] shadow-[0_0_0_1px_var(--accent-700)]"><i className="ph ph-package text-base" aria-hidden="true" /></span>
        <span className="text-sm font-semibold tracking-[0.02em] text-[var(--color-text)]">EmpresTI</span>
      </Link>
      <nav className="flex flex-col gap-[18px]" aria-label="Navegação principal">
        <NavigationGroup label="Colaborador" items={collaboratorItems} />
        <NavigationGroup label="Operações" items={operationsItems} />
      </nav>
      <div className="mt-auto flex items-center gap-[9px] rounded-[10px] border border-[var(--border-soft)] bg-[var(--surface-sunken)] p-3">
        <span className="flex size-7 items-center justify-center rounded-full bg-[var(--accent-800)] text-[11px] font-semibold text-[var(--accent-300)]">MA</span>
        <div className="min-w-0"><p className="truncate text-[12px] font-semibold text-[var(--color-text)]">Marina Alves</p><p className="truncate text-[11px] text-[var(--text-faint)]">Design</p></div>
      </div>
    </aside>
  );
}

function Header() {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-5 border-b border-[var(--border-soft)] px-7">
      <label className="flex h-9 w-full max-w-[420px] items-center gap-2 rounded-lg border border-[var(--border-frame)] bg-[var(--surface-sunken)] px-3 text-[var(--text-faint)]">
        <i className="ph ph-magnifying-glass text-[17px]" aria-hidden="true" />
        <input className="min-w-0 flex-1 bg-transparent text-[13px] text-[var(--color-text)] outline-none placeholder:text-[var(--text-faint)]" placeholder="Buscar equipamento" type="search" />
      </label>
      <div className="flex items-center gap-[14px]">
        <span className="whitespace-nowrap text-[12px] text-[var(--text-dim)]">2 de 3 itens com você</span>
        <Button aria-label="Notificações" className="size-[34px] px-0" variant="secondary"><i className="ph ph-bell text-[17px]" aria-hidden="true" /></Button>
      </div>
    </header>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return <div className="flex min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]"><Sidebar /><div className="flex min-w-0 flex-1 flex-col"><Header /><main className="flex flex-1 flex-col gap-[22px] px-7 py-7">{children}</main></div></div>;
}
