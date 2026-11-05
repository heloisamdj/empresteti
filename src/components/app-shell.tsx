"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/trpc";
import { categoryLabels, MAX_ITEMS } from "@/lib/contracts";
import { Button, Icon, Loading, Notice, cn } from "./ui";
const AppSearchContext = createContext<{
  search: string;
  setSearch: (value: string) => void;
}>({ search: "", setSearch: () => {} });
export function useAppSearch() {
  return useContext(AppSearchContext);
}
const nav = [
  {
    group: "Colaborador",
    href: "/catalogo",
    icon: "squares-four",
    label: "Catálogo",
  },
  {
    group: "Colaborador",
    href: "/meus-emprestimos",
    icon: "hand-arrow-down",
    label: "Meus empréstimos",
  },
  {
    group: "Operações",
    href: "/operacoes/emprestimos",
    icon: "list-checks",
    label: "Empréstimos em aberto",
  },
  {
    group: "Operações",
    href: "/operacoes/equipamentos/novo",
    icon: "plus-square",
    label: "Cadastrar equipamento",
  },
];
export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [searchByPath, setSearchByPath] = useState<Record<string, string>>({});
  const search = searchByPath[pathname] ?? "";
  const setSearch = (value: string) =>
    setSearchByPath((previous) => ({ ...previous, [pathname]: value }));
  const cache = useQueryClient();
  const session = api.auth.session.useQuery();
  const mine = api.loans.mine.useQuery(undefined, { enabled: !!session.data });
  const detailPatrimony = pathname.startsWith("/catalogo/")
    ? decodeURIComponent(pathname.split("/").at(-1) ?? "")
    : "";
  const detail = api.equipment.detail.useQuery(
    { patrimony: detailPatrimony || "_" },
    { enabled: !!session.data && !!detailPatrimony },
  );
  const logout = api.auth.logout.useMutation({
    onSuccess: () => {
      cache.clear();
      router.replace("/login");
    },
  });
  useEffect(() => {
    if (session.isSuccess && !session.data) router.replace("/login");
  }, [session.isSuccess, session.data, router]);
  if (session.isError)
    return (
      <main className="mx-auto flex max-w-xl flex-col gap-5 p-8">
        <h1 className="text-xl font-semibold">EmpresTI</h1>
        <Notice error>
          Não foi possível verificar a sessão. Confira a conexão e tente
          novamente.
        </Notice>
        <Button onClick={() => session.refetch()}>Tentar novamente</Button>
      </main>
    );
  if (!session.data) return <Loading />;
  const user = session.data;
  return (
    <AppSearchContext.Provider value={{ search, setSearch }}>
      <div className="flex min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
        <a
          href="#conteudo"
          className="fixed left-3 top-3 z-50 -translate-y-24 rounded-lg bg-[var(--color-surface)] p-3 focus:translate-y-0"
        >
          Ir para o conteúdo
        </a>
        <aside className="sticky top-0 hidden h-screen w-[236px] shrink-0 flex-col gap-[26px] border-r border-[var(--border-soft)] bg-[var(--sidebar-bg)] px-[14px] py-[22px] md:flex">
          <Link className="flex items-center gap-2.5 px-2" href="/catalogo">
            <span className="flex size-7 items-center justify-center rounded-[7px] border border-[var(--accent-700)] bg-[var(--accent-900)] text-[var(--accent-400)]">
              <Icon name="package" />
            </span>
            <span className="text-sm font-semibold tracking-[0.02em]">
              EmpresTI
            </span>
          </Link>
          <nav
            aria-label="Navegação principal"
            className="flex flex-col gap-[18px]"
          >
            {["Colaborador", "Operações"].map((group) => (
              <section key={group} className="flex flex-col gap-[3px]">
                <p className="px-2 pb-1 text-[10px] uppercase tracking-[0.12em] text-[var(--text-dim)]">
                  {group}
                </p>
                {nav
                  .filter((item) => item.group === group)
                  .map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-2.5 rounded-lg px-2.5 py-[9px] text-[13px] text-[var(--text-dim)] transition-colors duration-[120ms] ease-out hover:bg-[var(--surface-sunken)]",
                        pathname.startsWith(item.href) &&
                          "bg-[var(--color-surface)] text-[var(--color-text)] shadow-[inset_2px_0_0_var(--accent-500)]",
                      )}
                      aria-current={
                        pathname.startsWith(item.href) ? "page" : undefined
                      }
                    >
                      <Icon
                        name={item.icon}
                        weight={
                          pathname.startsWith(item.href) ? "fill" : "regular"
                        }
                        className="text-lg text-[var(--accent-400)]"
                      />
                      <span>{item.label}</span>
                      {item.href === "/meus-emprestimos" &&
                        !!mine.data?.openCount && (
                          <span className="ml-auto rounded-full bg-[var(--accent-800)] px-2 text-[11px] text-[var(--accent-300)]">
                            {mine.data.openCount}
                          </span>
                        )}
                    </Link>
                  ))}
              </section>
            ))}
          </nav>
          <div className="mt-auto flex flex-col gap-3 rounded-[10px] border border-[var(--border-soft)] bg-[var(--surface-sunken)] p-3">
            <div className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-full bg-[var(--accent-800)] text-xs text-[var(--accent-300)]">
                {user.name
                  .split(" ")
                  .slice(0, 2)
                  .map((s) => s[0])
                  .join("")}
              </span>
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold">{user.name}</p>
                <p className="truncate text-[11px] text-[var(--text-muted)]">
                  {user.department ?? user.tenantName}
                </p>
              </div>
            </div>
            <Button
              variant="secondary"
              disabled={logout.isPending}
              onClick={() => logout.mutate()}
            >
              Sair
            </Button>
            {logout.error && (
              <p role="alert" className="text-xs text-[var(--status-late)]">
                {logout.error.message}
              </p>
            )}
          </div>
        </aside>
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex min-h-16 flex-wrap items-center justify-between gap-3 border-b border-[var(--border-soft)] px-5 py-3 lg:px-7">
            <Link href="/catalogo" className="font-semibold md:hidden">
              EmpresTI
            </Link>
            {pathname === "/catalogo" ||
            pathname === "/operacoes/emprestimos" ? (
              <label className="flex min-h-9 w-full max-w-[420px] items-center gap-2 rounded-lg border border-[var(--border-frame)] bg-[var(--surface-sunken)] px-3">
                <Icon name="magnifying-glass" />
                <input
                  aria-label={
                    pathname === "/catalogo"
                      ? "Buscar equipamento"
                      : "Buscar empréstimos"
                  }
                  placeholder={
                    pathname === "/catalogo"
                      ? "Buscar equipamento"
                      : "Pessoa, equipamento ou patrimônio"
                  }
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="min-h-9 min-w-0 flex-1 bg-transparent text-[13px]"
                />
              </label>
            ) : (
              <nav
                aria-label="Breadcrumb"
                className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-muted)]"
              >
                <Link
                  href={
                    pathname.startsWith("/operacoes")
                      ? "/operacoes/emprestimos"
                      : "/catalogo"
                  }
                  className="text-[var(--accent-400)]"
                >
                  {pathname.startsWith("/operacoes") ? "Operações" : "Catálogo"}
                </Link>
                <span aria-hidden="true">›</span>
                {detailPatrimony && (
                  <>
                    <span>
                      {detail.data
                        ? categoryLabels[detail.data.category]
                        : "Equipamento"}
                    </span>
                    <span aria-hidden="true">›</span>
                  </>
                )}
                <span>
                  {pathname === "/meus-emprestimos"
                    ? "Meus empréstimos"
                    : pathname.startsWith("/operacoes")
                      ? "Cadastrar equipamento"
                      : decodeURIComponent(pathname.split("/").at(-1) ?? "")}
                </span>
              </nav>
            )}
            {pathname === "/meus-emprestimos" && (
              <Button asChild>
                <Link href="/catalogo">Pegar emprestado</Link>
              </Button>
            )}
            {pathname === "/operacoes/emprestimos" && (
              <Button asChild>
                <Link href="/operacoes/equipamentos/novo">
                  Cadastrar equipamento
                </Link>
              </Button>
            )}
            <span className="text-xs text-[var(--text-dim)]">
              {mine.data?.openCount ?? 0} de {MAX_ITEMS} itens com você
            </span>
            {pathname === "/catalogo" && (
              <Button
                disabled
                variant="secondary"
                aria-label="Notificações"
                title="Notificações indisponíveis nesta versão"
                className="size-[34px] px-0"
              >
                <Icon name="bell" />
              </Button>
            )}
            <Button
              className="md:hidden"
              variant="secondary"
              onClick={() => logout.mutate()}
            >
              Sair
            </Button>
          </header>
          <nav
            aria-label="Navegação móvel"
            className="flex gap-3 overflow-auto border-b border-[var(--border-soft)] p-3 text-xs md:hidden"
          >
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="whitespace-nowrap rounded-md border border-[var(--border-frame)] p-2"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <main
            id="conteudo"
            className="flex w-full max-w-[1500px] flex-1 flex-col gap-[22px] px-5 py-7 lg:px-7"
          >
            {children}
          </main>
        </div>
      </div>
    </AppSearchContext.Provider>
  );
}
