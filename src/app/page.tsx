import { AppShell } from "@/components/app-shell";

export default function Home() {
  return (
    <AppShell>
      <section className="flex max-w-[56ch] flex-col gap-2" data-screen-label="02 Catálogo">
        <p className="text-[11px] uppercase tracking-[0.1em] text-[var(--text-faint)]">EmpresTI</p>
        <h1 className="text-2xl font-semibold tracking-[-0.01em] text-[var(--color-text)]">Catálogo</h1>
        <p className="text-[13px] text-[var(--text-muted)]">A estrutura da tela será preenchida na próxima tarefa do catálogo.</p>
      </section>
    </AppShell>
  );
}
