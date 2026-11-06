"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { api } from "@/lib/trpc";
import { useAppSearch } from "./app-shell";
import {
  categories,
  categoryLabels,
  equipmentInput,
  formatDate,
  loginInput,
  LOAN_DAYS,
  MAX_ITEMS,
} from "@/lib/contracts";
import { examples, categoryIcon } from "@/lib/examples";
import {
  Button,
  Dialog,
  Empty,
  fieldClass,
  Icon,
  Loading,
  Notice,
  panelClass,
  ScreenTitle,
  StatusPill,
  cn,
} from "./ui";

type Category = (typeof categories)[number];
function PhotoCredit() {
  return (
    <a
      href="https://pixabay.com/"
      className="w-fit text-xs text-[var(--accent-400)] underline underline-offset-2"
    >
      Fotos: Pixabay
    </a>
  );
}

function EquipmentPhoto({ url, name }: { url: string; name: string }) {
  return (
    <Image
      unoptimized
      src={url}
      alt={name}
      width={800}
      height={600}
      className="aspect-[4/3] h-auto w-full rounded-lg object-cover"
    />
  );
}

function RuleNotice() {
  return (
    <Notice className="bg-[linear-gradient(90deg,#0E1530,#0B1128)] px-4 py-[13px] text-[12.5px] text-[var(--text-secondary)] [&>i]:text-[var(--accent-400)]">
      <p className="text-[13px] font-semibold text-[var(--color-text)]">
        Equipamento certo, na hora certa.
      </p>
      <p>
        Até {MAX_ITEMS} itens por pessoa · prazo de {LOAN_DAYS} dias úteis ·
        atraso bloqueia novos pedidos · manutenção indisponível para empréstimo.
      </p>
    </Notice>
  );
}
function ExampleNotice() {
  return (
    <Notice>
      Dados de exemplo para conhecer as telas. Nenhum empréstimo ou alteração
      será registrado com esses exemplos.
    </Notice>
  );
}
function CategoryIcon({
  category,
  large = false,
}: {
  category: string;
  large?: boolean;
}) {
  return (
    <span
      className={cn(
        "flex items-center justify-center rounded-[9px] bg-[var(--surface-sunken)] text-[var(--accent-400)]",
        large ? "size-24 text-[64px]" : "size-10 text-xl",
      )}
    >
      <Icon name={categoryIcon[category] ?? "package"} />
    </span>
  );
}
function EquipmentStatus({
  status,
  borrowed,
}: {
  status: string;
  borrowed?: boolean;
}) {
  return status === "MAINTENANCE" ? (
    <StatusPill tone="maintenance">Em manutenção</StatusPill>
  ) : status === "OUT_OF_SERVICE" ? (
    <StatusPill tone="borrowed">Fora de uso</StatusPill>
  ) : borrowed ? (
    <StatusPill tone="borrowed">Emprestado</StatusPill>
  ) : (
    <StatusPill>Disponível</StatusPill>
  );
}
function Limit({ count }: { count: number }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-[var(--text-muted)]">
        {count} de {MAX_ITEMS} itens com você
      </p>
      <div className="flex gap-[5px]" aria-hidden="true">
        {Array.from({ length: MAX_ITEMS }, (_, i) => (
          <span
            key={i}
            className={cn(
              "h-[5px] flex-1 rounded-full transition-colors duration-[240ms]",
              i < count ? "bg-[var(--accent-500)]" : "bg-[var(--border-frame)]",
            )}
          />
        ))}
      </div>
    </div>
  );
}

function SampleLoans() {
  return (
    <>
      {[
        {
          name: 'Dell UltraSharp 27"',
          pat: "PAT-0871",
          category: "MONITOR",
          due: "28/set",
        },
        {
          name: "Dock USB-C Anker",
          pat: "PAT-0455",
          category: "ACCESSORY",
          due: "05/out",
        },
      ].map((item) => (
        <article
          key={item.pat}
          className={cn(
            panelClass,
            "flex flex-wrap items-center gap-4 opacity-70",
          )}
        >
          <CategoryIcon category={item.category} />
          <div className="flex-1">
            <h2 className="text-sm font-semibold">{item.name}</h2>
            <p className="text-xs text-[var(--text-muted)]">
              {item.pat} · exemplo de empréstimo
            </p>
          </div>
          <span className="text-xs">Até {item.due}</span>
          <Button disabled variant="row">
            Somente exemplo
          </Button>
        </article>
      ))}
    </>
  );
}
function SampleHistoryRows() {
  return (
    <>
      {[
        ["ThinkPad T14", "02/set", "16/set", "No prazo"],
        ["Sony A7 III", "05/set", "20/set", "Com atraso"],
        ["Dock USB-C Anker", "01/set", "15/set", "No prazo"],
      ].map((row) => (
        <tr
          key={row[0]}
          className="border-t border-[var(--border-row)] text-[var(--text-muted)]"
        >
          {row.map((value, i) => (
            <td key={i} className="px-4 py-4">
              {value}
              {i === 0 ? " · exemplo" : ""}
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
function SampleOperationsRows() {
  return (
    <>
      {[
        [
          'MacBook Pro 14"',
          "PAT-1042",
          "Marina Alves",
          "10/set",
          "24/set",
          "No prazo",
        ],
        [
          "ThinkPad T14",
          "PAT-1188",
          "Camila Duarte",
          "02/set",
          "16/set",
          "Em atraso",
        ],
        [
          "Sony A7 III",
          "PAT-0233",
          "Rafael Lima",
          "18/set",
          "02/out",
          "No prazo",
        ],
        [
          "Projetor Epson X49",
          "PAT-0102",
          "Helena Prado",
          "01/set",
          "15/set",
          "Em atraso",
        ],
        [
          "ThinkPad T14",
          "PAT-1190",
          "Tiago Menezes",
          "30/ago",
          "13/set",
          "Em atraso",
        ],
        [
          "Dock USB-C Anker",
          "PAT-0455",
          "Ana Sato",
          "15/set",
          "29/set",
          "No prazo",
        ],
        [
          "Adaptador HDMI Belkin",
          "PAT-0338",
          "Bruno Kato",
          "19/set",
          "03/out",
          "No prazo",
        ],
      ].map((row) => (
        <tr
          key={row[1]}
          className="border-t border-[var(--border-row)] text-xs text-[var(--text-muted)]"
        >
          <td className="px-4 py-4">
            {row[0]}
            <p>{row[1]} · exemplo</p>
          </td>
          <td className="px-4 py-4">{row[2]}</td>
          <td className="px-4 py-4">{row[3]}</td>
          <td className="px-4 py-4">{row[4]}</td>
          <td className="px-4 py-4">
            <StatusPill tone={row[5] === "Em atraso" ? "late" : "available"}>
              {row[5]}
            </StatusPill>
          </td>
          <td className="px-4 py-4">
            <Button disabled variant="row">
              Somente exemplo
            </Button>
          </td>
        </tr>
      ))}
    </>
  );
}
function SampleRecent() {
  return (
    <>
      <ExampleNotice />
      {[
        { name: 'MacBook Air 13" M2', pat: "PAT-1204" },
        { name: "Dock USB-C Anker", pat: "PAT-0455" },
        { name: "Adaptador HDMI Belkin", pat: "PAT-0338" },
      ].map((item) => (
        <div
          key={item.pat}
          className="border-b border-[var(--border-row)] pb-3 text-xs text-[var(--text-muted)]"
        >
          <p>{item.name}</p>
          <p>{item.pat} · exemplo</p>
        </div>
      ))}
    </>
  );
}

export function LoginScreen() {
  const router = useRouter();
  const utils = api.useUtils();
  const session = api.auth.session.useQuery();
  const form = useForm<z.infer<typeof loginInput>>({
    resolver: zodResolver(loginInput),
    defaultValues: { email: "", password: "" },
  });
  const login = api.auth.login.useMutation({
    onSuccess: (identity) => {
      utils.auth.session.setData(undefined, identity);
      router.replace("/catalogo");
    },
  });
  useEffect(() => {
    if (session.data) router.replace("/catalogo");
  }, [session.data, router]);
  return (
    <main
      className="grid min-h-screen lg:grid-cols-[minmax(420px,40%)_1fr]"
      data-screen-label="01 Login"
    >
      <section className="flex flex-col justify-between gap-10 border-r border-[var(--border-soft)] bg-gradient-to-br from-[#001449] via-[#00102f] to-[#080c1a] px-8 py-9 lg:p-14">
        <Link
          href="/login"
          className="flex items-center gap-3 text-base font-semibold"
        >
          <Icon name="package" className="text-2xl text-[var(--accent-400)]" />
          EmpresTI
        </Link>
        <div className="flex max-w-[38ch] flex-col gap-6">
          <h1 className="max-w-[20ch] text-[34px] font-semibold leading-[1.15] tracking-[-0.01em]">
            Tudo o que você precisa para trabalhar. Em um só lugar.
          </h1>
          <p className="text-sm leading-relaxed text-[var(--text-muted)]">
            Consulte os equipamentos da equipe, solicite um empréstimo e
            acompanhe seus prazos.
          </p>
          <div className="h-px bg-gradient-to-r from-[var(--accent-600)] to-transparent" />
          <div className="flex gap-10">
            <div>
              <p className="text-2xl font-semibold">{MAX_ITEMS} itens</p>
              <p className="pt-1 text-xs text-[var(--text-muted)]">
                por pessoa
              </p>
            </div>
            <div>
              <p className="text-2xl font-semibold">{LOAN_DAYS} dias úteis</p>
              <p className="pt-1 text-xs text-[var(--text-muted)]">
                de prazo padrão
              </p>
            </div>
          </div>
        </div>
        <p className="text-[11px] text-[var(--text-muted)]">Operações · v1</p>
      </section>
      <section className="flex items-center justify-center p-8 lg:p-14">
        <form
          onSubmit={form.handleSubmit((data) => login.mutate(data))}
          className="flex w-full max-w-[372px] flex-col gap-[18px]"
          noValidate
        >
          <div className="flex flex-col gap-2 pb-3">
            <h2 className="text-[22px] font-semibold">Entrar</h2>
            <p className="text-[13px] text-[var(--text-muted)]">
              Use sua conta para acessar os equipamentos.
            </p>
          </div>
          <label className="flex flex-col gap-2 text-xs">
            E-mail
            <input
              autoComplete="username"
              type="email"
              className={fieldClass}
              {...form.register("email")}
              aria-invalid={!!form.formState.errors.email}
            />
            {form.formState.errors.email && (
              <span role="alert" className="text-[var(--status-late)]">
                {form.formState.errors.email.message}
              </span>
            )}
          </label>
          <label className="flex flex-col gap-2 text-xs">
            Senha
            <input
              autoComplete="current-password"
              type="password"
              className={fieldClass}
              {...form.register("password")}
              aria-invalid={!!form.formState.errors.password}
            />
            {form.formState.errors.password && (
              <span role="alert" className="text-[var(--status-late)]">
                {form.formState.errors.password.message}
              </span>
            )}
          </label>
          {login.error && <Notice error>{login.error.message}</Notice>}
          {session.error && (
            <Notice error>
              Não foi possível consultar a sessão. Verifique a conexão e a
              configuração do servidor.
            </Notice>
          )}
          <Button type="submit" className="min-h-11" disabled={login.isPending}>
            {login.isPending ? "Entrando…" : "Entrar"}
            <Icon name="arrow-right" />
          </Button>
          <div className="h-px bg-[var(--border-frame)]" />
          <p className="text-center text-xs leading-relaxed text-[var(--text-muted)]">
            Precisa de acesso? Solicite seu convite a Operações.
          </p>
        </form>
      </section>
    </main>
  );
}

export function CatalogScreen() {
  const { search } = useAppSearch();
  const [category, setCategory] = useState<Category | undefined>();
  const [availableOnly, setAvailableOnly] = useState(false);
  const query = api.equipment.list.useInfiniteQuery(
    { search, category, availableOnly, limit: 12 },
    { getNextPageParam: (page) => page.nextCursor },
  );
  if (query.isPending) return <Loading />;
  if (query.error) return <Notice error>{query.error.message}</Notice>;
  const first = query.data.pages[0];
  const rows = query.data.pages.flatMap((page) => page.items);
  const sample = first.total === 0;
  const display = sample
    ? examples.map((item) => ({
        ...item,
        photoUrl: null,
        person: undefined as string | undefined,
        dueDate: undefined as Date | undefined,
      }))
    : rows.map((item) => ({
        ...item,
        borrowed: item.loans.length > 0,
        person: item.loans[0]?.user.name,
        dueDate: item.loans[0]?.dueDate,
      }));
  return (
    <section
      className="flex flex-col gap-[22px]"
      data-screen-label="02 Catálogo"
    >
      <ScreenTitle
        title="Catálogo"
        description={
          sample
            ? "Conheça os equipamentos · exemplos do catálogo"
            : `${first.total} ${first.total === 1 ? "equipamento" : "equipamentos"} · ${first.availableCount} ${first.availableCount === 1 ? "disponível" : "disponíveis"} agora`
        }
      />
      <RuleNotice />
      {sample && <ExampleNotice />}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {[undefined, ...categories].map((value) => (
            <Button
              key={value ?? "all"}
              variant={category === value ? "confirmation" : "secondary"}
              aria-pressed={category === value}
              className={cn(
                "min-h-8 rounded-full px-3 py-[6px] text-xs",
                category === value
                  ? "border-[var(--accent-700)] bg-[var(--accent-800)] text-[var(--accent-200)]"
                  : "border-[var(--border-frame)] bg-transparent text-[var(--text-secondary)]",
              )}
              onClick={() => setCategory(value)}
            >
              {value ? categoryLabels[value] : "Todos"}
            </Button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
          <input
            type="checkbox"
            checked={availableOnly}
            onChange={(e) => setAvailableOnly(e.target.checked)}
          />
          Só disponíveis
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {display.map((item) => {
          const available = item.status === "AVAILABLE" && !item.borrowed;
          const content = (
            <>
              {item.photoUrl && (
                <EquipmentPhoto url={item.photoUrl} name={item.name} />
              )}
              <div className="flex items-center justify-between gap-3">
                <CategoryIcon category={item.category} />
                <EquipmentStatus
                  status={item.status}
                  borrowed={item.borrowed}
                />
              </div>
              <div className="flex flex-col gap-1">
                <h2 className="text-[14.5px] font-semibold">{item.name}</h2>
                <p className="text-xs text-[var(--text-dim)]">
                  {categoryLabels[item.category as Category]} · {item.patrimony}
                </p>
              </div>
              <p
                className={cn(
                  "text-xs",
                  available
                    ? "text-[var(--accent-400)]"
                    : "text-[var(--text-muted)]",
                )}
              >
                {available
                  ? sample
                    ? "Ver exemplo →"
                    : "Solicitar →"
                  : item.status === "MAINTENANCE"
                    ? "Indisponível para empréstimo"
                    : item.person
                      ? `Com ${item.person} · devolve ${formatDate(item.dueDate!)}`
                      : "Em uso por um colaborador"}
              </p>
            </>
          );
          return available ? (
            <Link
              key={item.id}
              href={`/catalogo/${item.patrimony}${sample ? "?exemplo=1" : ""}`}
              className={cn(
                panelClass,
                "flex flex-col gap-3 p-4 transition-[border-color] duration-[160ms] ease-out hover:border-[var(--accent-600)]",
              )}
            >
              {content}
            </Link>
          ) : (
            <article
              key={item.id}
              className={cn(panelClass, "flex flex-col gap-3 p-4")}
            >
              {content}
            </article>
          );
        })}
        {display.length === 0 && (
          <Empty>Nenhum equipamento com esses filtros.</Empty>
        )}
      </div>
      {display.some((item) => item.photoUrl) && <PhotoCredit />}
      {query.hasNextPage && (
        <Button
          onClick={() => query.fetchNextPage()}
          disabled={query.isFetchingNextPage}
        >
          Carregar mais equipamentos
        </Button>
      )}
    </section>
  );
}

export function DetailScreen({ patrimony }: { patrimony: string }) {
  const router = useRouter();
  const utils = api.useUtils();
  const [open, setOpen] = useState(false);
  const query = api.equipment.detail.useInfiniteQuery(
    { patrimony, limit: 20 },
    { getNextPageParam: (page) => page.nextCursor },
  );
  const mine = api.loans.mine.useQuery();
  const mutation = api.loans.request.useMutation({
    onSuccess: async () => {
      await utils.invalidate();
      router.push("/meus-emprestimos");
    },
  });
  if (query.isPending || mine.isPending) return <Loading />;
  if (mine.error) return <Notice error>{mine.error.message}</Notice>;
  const detail = query.data?.pages[0];
  const itemHistory = query.data?.pages.flatMap((page) => page.loans) ?? [];
  const example =
    !detail && query.error?.data?.code === "NOT_FOUND"
      ? examples.find((item) => item.patrimony === patrimony)
      : undefined;
  if (!detail && !example)
    return (
      <Notice error>
        {query.error?.message ?? "Equipamento não encontrado."}
      </Notice>
    );
  const item = detail ?? example!;
  const active = detail?.activeLoan;
  const count = mine.data.openCount;
  const blocked =
    !!example ||
    count >= MAX_ITEMS ||
    mine.data.overdue ||
    item.status !== "AVAILABLE" ||
    !!active;
  const reason = example
    ? "Cadastre um equipamento real para solicitar um empréstimo."
    : mine.data.overdue
      ? "Você tem item em atraso. Regularize a devolução para solicitar outro."
      : count >= MAX_ITEMS
        ? `Limite de ${MAX_ITEMS} itens atingido. Devolva um item antes de solicitar outro.`
        : item.status !== "AVAILABLE" || active
          ? "Este equipamento não está disponível."
          : "Retirada no local indicado. A devolução será confirmada por Operações.";
  const due = mine.data.expectedDueDate;
  return (
    <section
      className="flex flex-col gap-6"
      data-screen-label="03 Detalhe do item"
    >
      <Link href="/catalogo" className="w-fit text-xs text-[var(--accent-400)]">
        Catálogo › {categoryLabels[item.category as Category]} ›{" "}
        {item.patrimony}
      </Link>
      {example && <ExampleNotice />}
      <div className="grid items-start gap-8 xl:grid-cols-[1fr_356px]">
        <div className="flex flex-col gap-6">
          {detail?.photoUrl ? (
            <div className="flex flex-col gap-2">
              <EquipmentPhoto url={detail.photoUrl} name={item.name} />
              <PhotoCredit />
            </div>
          ) : (
            <div className="flex h-[260px] items-center justify-center rounded-xl border border-[var(--border-card)] bg-radial from-[var(--accent-800)] to-[var(--surface-sunken)]">
              <CategoryIcon category={item.category} large />
            </div>
          )}
          <div className="flex flex-wrap items-center gap-4">
            <h1 className="text-[28px] font-semibold tracking-[-0.01em]">
              {item.name}
            </h1>
            <EquipmentStatus
              status={item.status}
              borrowed={!!active || !!example?.borrowed}
            />
          </div>
          <p className="max-w-[60ch] text-[13px] leading-relaxed text-[var(--text-muted)]">
            {detail?.notes ||
              `${categoryLabels[item.category as Category]} para uso interno. Confira o local de retirada e o prazo antes de solicitar.`}
          </p>
          <dl className="grid grid-cols-2 gap-5 rounded-xl border border-[var(--border-soft)] p-5 lg:grid-cols-4">
            {[
              ["Categoria", categoryLabels[item.category as Category]],
              ["Patrimônio", item.patrimony],
              ["Local", detail?.location ?? "Consulte Operações"],
              [
                "Última devolução",
                detail?.loans.find((loan) => loan.returnedAt)?.returnedAt
                  ? formatDate(
                      detail.loans.find((loan) => loan.returnedAt)!.returnedAt!,
                    )
                  : "Sem registro",
              ],
            ].map(([label, value]) => (
              <div key={label} className="flex flex-col gap-2">
                <dt className="text-xs text-[var(--text-muted)]">{label}</dt>
                <dd className="text-[13px]">{value}</dd>
              </div>
            ))}
          </dl>
          <h2 className="text-[17px] font-semibold">Histórico</h2>
          {query.hasNextPage && (
            <Button
              onClick={() => query.fetchNextPage()}
              disabled={query.isFetchingNextPage}
            >
              Carregar mais histórico
            </Button>
          )}
          {itemHistory.length ? (
            <div className="flex flex-col divide-y divide-[var(--border-row)]">
              {itemHistory.map((loan) => (
                <div
                  key={loan.id}
                  className="flex flex-wrap justify-between gap-3 py-3 text-xs"
                >
                  <span>
                    {formatDate(loan.borrowedAt)} · {loan.user.name}
                  </span>
                  <span className="text-[var(--text-muted)]">
                    {loan.returnedAt
                      ? `Devolvido em ${formatDate(loan.returnedAt)}`
                      : loan.returnRequestedAt
                        ? "Aguardando confirmação da devolução"
                        : "Empréstimo em aberto"}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <Empty>Sem histórico de empréstimos.</Empty>
          )}
        </div>
        <aside className="flex flex-col gap-4">
          <div className={cn(panelClass, "flex flex-col gap-5")}>
            <h2 className="text-[17px] font-semibold">Solicitar empréstimo</h2>
            <dl className="flex flex-col gap-3 text-[13px]">
              <div className="flex justify-between">
                <dt className="text-[var(--text-muted)]">Retirada</dt>
                <dd>Hoje</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[var(--text-muted)]">Prazo padrão</dt>
                <dd>{LOAN_DAYS} dias úteis</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[var(--text-muted)]">Devolver até</dt>
                <dd className="font-semibold text-[var(--accent-300)]">
                  {formatDate(due)}
                </dd>
              </div>
            </dl>
            <Button disabled={blocked} onClick={() => setOpen(true)}>
              Solicitar empréstimo
            </Button>
            <p className="text-xs leading-relaxed text-[var(--text-muted)]">
              {reason}
            </p>
            {mutation.error && <Notice error>{mutation.error.message}</Notice>}
          </div>
          <div className={cn(panelClass, "flex flex-col gap-4")}>
            <h2 className="text-[15px] font-semibold">Seus itens</h2>
            <Limit count={count} />
            <p className="text-xs text-[var(--text-muted)]">
              {mine.data.overdue
                ? "Há item em atraso."
                : "Nenhum item em atraso."}
            </p>
          </div>
        </aside>
      </div>
      <Dialog
        open={open}
        onOpenChange={setOpen}
        title="Confirmar empréstimo"
        description={`Solicitar ${item.name} (${item.patrimony}), com prazo de ${LOAN_DAYS} dias úteis e devolução prevista para ${formatDate(due)}?`}
      >
        <Notice>
          Você passará a ter {count + 1} de {MAX_ITEMS} itens. O prazo
          definitivo será calculado pelo servidor na confirmação.
        </Notice>
        <Button
          variant="confirmation"
          disabled={mutation.isPending}
          onClick={() => mutation.mutate({ id: item.id })}
        >
          {mutation.isPending ? "Confirmando…" : "Confirmar empréstimo"}
        </Button>
        {mutation.error && <Notice error>{mutation.error.message}</Notice>}
      </Dialog>
    </section>
  );
}

export function MyLoansScreen() {
  const utils = api.useUtils();
  const query = api.loans.mine.useInfiniteQuery(
    { limit: 20 },
    { getNextPageParam: (page) => page.nextCursor },
  );
  const mutation = api.loans.requestReturn.useMutation({
    onSuccess: () => utils.invalidate(),
  });
  if (query.isPending) return <Loading />;
  if (query.error) return <Notice error>{query.error.message}</Notice>;
  const data = query.data.pages[0];
  const open = data.openItems;
  const history = query.data.pages.flatMap((page) => page.items);
  return (
    <section
      className="flex flex-col gap-6"
      data-screen-label="04 Meus empréstimos"
    >
      <ScreenTitle
        title="Comigo agora"
        description={`${data.openCount} de ${MAX_ITEMS} itens · ${data.overdue ? "há item em atraso" : "nenhum em atraso"}`}
        action={
          <Button asChild>
            <Link href="/catalogo">Pegar emprestado</Link>
          </Button>
        }
      />
      <div className="max-w-[180px]">
        <Limit count={data.openCount} />
      </div>
      {mutation.error && <Notice error>{mutation.error.message}</Notice>}
      {mutation.isSuccess && (
        <Notice>
          Solicitação registrada. Leve o equipamento a Operações para confirmar
          a devolução.
        </Notice>
      )}
      <div className="flex flex-col gap-3">
        {open.map((loan) => {
          const late = loan.dueDate < data.serverNow;
          const duration = Math.max(
            1,
            loan.dueDate.getTime() - loan.borrowedAt.getTime(),
          );
          const elapsed = data.serverNow.getTime() - loan.borrowedAt.getTime();
          return (
            <article
              key={loan.id}
              className={cn(
                panelClass,
                "flex flex-wrap items-center gap-[18px]",
                late && "border-rose-400/30",
              )}
            >
              <CategoryIcon category={loan.equipment.category} />
              <div className="flex min-w-[180px] flex-1 flex-col gap-1">
                <h2 className="text-[15px] font-semibold">
                  {loan.equipment.name}
                </h2>
                <p className="text-xs text-[var(--text-dim)]">
                  {loan.equipment.patrimony} · retirado em{" "}
                  {formatDate(loan.borrowedAt)}
                </p>
              </div>
              <div className="flex min-w-[150px] flex-col gap-2">
                <span className="text-xs">
                  Devolver até {formatDate(loan.dueDate)}
                </span>
                <progress
                  aria-label="Prazo decorrido"
                  max={duration}
                  value={Math.max(0, Math.min(duration, elapsed))}
                  className="h-1 w-full overflow-hidden rounded-full accent-[var(--accent-500)] [&::-webkit-progress-value]:transition-[width] [&::-webkit-progress-value]:duration-[240ms]"
                />
                <StatusPill
                  tone={
                    late
                      ? "late"
                      : loan.returnRequestedAt
                        ? "maintenance"
                        : "available"
                  }
                >
                  {loan.returnRequestedAt
                    ? "Aguardando Operações"
                    : late
                      ? "Em atraso"
                      : "No prazo"}
                </StatusPill>
              </div>
              <Button
                variant={late ? "late" : "row"}
                disabled={!!loan.returnRequestedAt || mutation.isPending}
                onClick={() => mutation.mutate({ id: loan.id })}
              >
                {loan.returnRequestedAt
                  ? "Devolução solicitada"
                  : "Solicitar devolução"}
              </Button>
            </article>
          );
        })}
        {!open.length && (
          <>
            <Empty>
              Nenhum empréstimo em aberto. Consulte o catálogo para solicitar um
              item.
            </Empty>
            <ExampleNotice />
            <SampleLoans />
          </>
        )}
      </div>
      <div className="h-px bg-[var(--border-frame)]" />
      <h2 className="text-[17px] font-semibold">Histórico</h2>
      {query.hasNextPage && (
        <Button
          onClick={() => query.fetchNextPage()}
          disabled={query.isFetchingNextPage}
        >
          Carregar mais histórico
        </Button>
      )}
      <div className="overflow-x-auto rounded-xl border border-[var(--border-soft)]">
        <table className="w-full min-w-[500px] text-left text-[13px]">
          <thead className="bg-[var(--surface-sunken)] text-[11px] text-[var(--text-muted)]">
            <tr>
              {["Item", "Retirada", "Devolução", "Situação"].map((label) => (
                <th key={label} className="px-4 py-3 font-normal">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {history.map((loan) => (
              <tr key={loan.id} className="border-t border-[var(--border-row)]">
                <td className="px-4 py-4">{loan.equipment.name}</td>
                <td className="px-4 py-4">{formatDate(loan.borrowedAt)}</td>
                <td className="px-4 py-4">{formatDate(loan.returnedAt!)}</td>
                <td className="px-4 py-4">
                  <StatusPill
                    tone={
                      loan.returnedAt! > loan.dueDate ? "late" : "available"
                    }
                  >
                    {loan.returnedAt! > loan.dueDate
                      ? "Devolvido com atraso"
                      : "No prazo"}
                  </StatusPill>
                </td>
              </tr>
            ))}
            {history.length === 0 && open.length === 0 && <SampleHistoryRows />}
          </tbody>
        </table>
        {!history.length && open.length > 0 && (
          <p className="p-5 text-xs text-[var(--text-muted)]">
            Nenhuma devolução confirmada.
          </p>
        )}
      </div>
    </section>
  );
}

export function OperationsScreen() {
  const utils = api.useUtils();
  const { search } = useAppSearch();
  const [filter, setFilter] = useState<"all" | "late" | "week" | "pending">(
    "all",
  );
  const [page, setPage] = useState(0);
  const [notebooks, setNotebooks] = useState(false);
  const [leavingId, setLeavingId] = useState<string | null>(null);
  const query = api.loans.operations.useInfiniteQuery(
    { search, filter, limit: 7, category: notebooks ? "NOTEBOOK" : undefined },
    { getNextPageParam: (result) => result.nextCursor },
  );
  const confirm = api.loans.confirmReturn.useMutation({
    onSuccess: async (result) => {
      setLeavingId(result.id);
      await new Promise((resolve) => setTimeout(resolve, 200));
      setPage(0);
      await utils.invalidate();
      setLeavingId(null);
    },
  });
  if (query.isPending) return <Loading />;
  if (query.error) return <Notice error>{query.error.message}</Notice>;
  const pageIndex = Math.min(page, query.data.pages.length - 1);
  const data = query.data.pages[pageIndex];
  const stats = query.data.pages[0].stats;
  return (
    <section
      className="flex flex-col gap-[22px]"
      data-screen-label="05 Operações"
    >
      <ScreenTitle
        title="Empréstimos em aberto"
        description={`${stats.open} itens fora · atualizado agora`}
        action={
          <Button asChild>
            <Link href="/operacoes/equipamentos/novo">
              <Icon name="plus" />
              Cadastrar equipamento
            </Link>
          </Button>
        }
      />
      <div className="grid grid-cols-2 gap-[14px] xl:grid-cols-4">
        {[
          ["Em aberto", stats.open, false],
          ["Vencem em 3 dias", stats.dueSoon, false],
          ["Em atraso", stats.late, true],
          ["Em manutenção", stats.maintenance, false],
        ].map(([label, value, late]) => (
          <div
            key={String(label)}
            className={cn(
              panelClass,
              "flex flex-col gap-3 p-4",
              late && "border-rose-400/30",
            )}
          >
            <p className="text-xs text-[var(--text-muted)]">{label}</p>
            <p
              className={cn(
                "text-[26px] font-semibold",
                late && "text-[var(--status-late)]",
              )}
            >
              {value}
            </p>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["all", "Todos"],
              ["late", "Em atraso"],
              ["week", "Vencem esta semana"],
              ["pending", "Devolução pendente"],
            ] as const
          ).map(([value, label]) => (
            <Button
              key={value}
              className="min-h-8 rounded-full px-3 text-xs"
              variant={filter === value ? "confirmation" : "secondary"}
              onClick={() => {
                setFilter(value);
                setPage(0);
              }}
            >
              {label}
            </Button>
          ))}
          <Button
            className="min-h-8 rounded-full px-3 text-xs"
            variant={notebooks ? "confirmation" : "secondary"}
            onClick={() => {
              setNotebooks(!notebooks);
              setPage(0);
            }}
          >
            Notebooks
          </Button>
        </div>
      </div>
      {confirm.error && <Notice error>{confirm.error.message}</Notice>}
      {confirm.isSuccess && (
        <Notice>Devolução confirmada. O empréstimo foi encerrado.</Notice>
      )}
      <div className="overflow-x-auto rounded-xl border border-[var(--border-soft)]">
        <table className="w-full min-w-[760px] text-left text-[13px]">
          <thead className="bg-[var(--surface-sunken)] text-[11px] text-[var(--text-muted)]">
            <tr>
              {[
                "Equipamento",
                "Colaborador",
                "Retirada",
                "Prazo",
                "Situação",
                "Ação",
              ].map((label) => (
                <th key={label} className="px-4 py-3 font-normal">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.items.map((loan) => {
              const late = loan.dueDate < data.serverNow;
              return (
                <tr
                  key={loan.id}
                  className={cn(
                    "border-t border-[var(--border-row)]",
                    leavingId === loan.id && "return-row-exit",
                    late && "bg-rose-400/5",
                  )}
                >
                  <td className="px-4 py-4">
                    <div className="loan-cell">
                      <p className="font-semibold">{loan.equipment.name}</p>
                      <p className="text-xs text-[var(--text-dim)]">
                        {loan.equipment.patrimony}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="loan-cell">{loan.user.name}</div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="loan-cell">
                      {formatDate(loan.borrowedAt)}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="loan-cell">{formatDate(loan.dueDate)}</div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="loan-cell">
                      <StatusPill
                        tone={
                          late
                            ? "late"
                            : loan.returnRequestedAt
                              ? "maintenance"
                              : "available"
                        }
                      >
                        {loan.returnRequestedAt
                          ? "Devolução pendente"
                          : late
                            ? "Em atraso"
                            : "No prazo"}
                      </StatusPill>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="loan-cell">
                      <Button
                        variant={late ? "late" : "row"}
                        className="min-h-[30px] px-2 py-1 text-xs"
                        disabled={!loan.returnRequestedAt || confirm.isPending}
                        onClick={() => confirm.mutate({ id: loan.id })}
                      >
                        Confirmar devolução
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {!data.items.length && <SampleOperationsRows />}
          </tbody>
        </table>
        {!data.items.length && (
          <Empty>Nenhum empréstimo com esses filtros.</Empty>
        )}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-xs text-[var(--text-muted)]">
          {data.items.length ? pageIndex * 7 + 1 : 0}–
          {pageIndex * 7 + data.items.length} de {data.total} empréstimos
        </p>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            disabled={pageIndex === 0}
            onClick={() => setPage(pageIndex - 1)}
          >
            Anterior
          </Button>
          <Button
            variant="secondary"
            disabled={
              (!query.hasNextPage &&
                pageIndex >= query.data.pages.length - 1) ||
              query.isFetchingNextPage
            }
            onClick={async () => {
              if (pageIndex >= query.data.pages.length - 1)
                await query.fetchNextPage();
              setPage(pageIndex + 1);
            }}
          >
            Próximo
          </Button>
        </div>
      </div>
      {!data.items.length && <ExampleNotice />}
    </section>
  );
}

export function RegisterScreen() {
  const utils = api.useUtils();
  const [another, setAnother] = useState(false);
  const [success, setSuccess] = useState("");
  const form = useForm<z.infer<typeof equipmentInput>>({
    resolver: zodResolver(equipmentInput),
    defaultValues: {
      name: "",
      category: "NOTEBOOK",
      patrimony: "",
      serialNumber: "",
      location: "",
      notes: "",
      status: "AVAILABLE",
    },
  });
  const values = useWatch({ control: form.control }) as z.infer<
    typeof equipmentInput
  >;
  const recent = api.equipment.list.useQuery({
    search: "",
    availableOnly: false,
    limit: 3,
    order: "recent",
  });
  const create = api.equipment.create.useMutation({
    onSuccess: async (item) => {
      setSuccess(`${item.name} (${item.patrimony}) cadastrado.`);
      await utils.invalidate();
      if (another) form.reset();
    },
  });
  const errors = form.formState.errors;
  return (
    <section
      className="flex flex-col gap-6"
      data-screen-label="06 Cadastrar equipamento"
    >
      <Link
        href="/operacoes/emprestimos"
        className="w-fit text-xs text-[var(--accent-400)]"
      >
        Operações › Cadastrar equipamento
      </Link>
      <ScreenTitle
        title="Cadastrar equipamento"
        description="Um registro por unidade física."
      />
      <div className="grid items-start gap-10 xl:grid-cols-[1fr_320px]">
        <form
          className="flex max-w-[620px] flex-col gap-5"
          noValidate
          onSubmit={form.handleSubmit((data) => {
            setSuccess("");
            create.mutate(data);
          })}
        >
          <div className="grid gap-[18px] sm:grid-cols-2">
            <label className="flex flex-col gap-2 text-xs sm:col-span-2">
              Nome do equipamento
              <input
                className={fieldClass}
                placeholder='Ex.: MacBook Air 13" M2'
                {...form.register("name")}
              />
              {errors.name && (
                <span role="alert" className="text-[var(--status-late)]">
                  {errors.name.message}
                </span>
              )}
            </label>
            <label className="flex flex-col gap-2 text-xs">
              Categoria
              <select
                aria-label="Categoria"
                className={fieldClass}
                {...form.register("category")}
              >
                {categories.map((value) => (
                  <option key={value} value={value}>
                    {categoryLabels[value]}
                    {value === "ACCESSORY" ? " (docks, adaptadores)" : ""}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-2 text-xs">
              Patrimônio
              <input
                className={fieldClass}
                placeholder="PAT-0000"
                {...form.register("patrimony")}
              />
              {errors.patrimony && (
                <span role="alert" className="text-[var(--status-late)]">
                  {errors.patrimony.message}
                </span>
              )}
            </label>
            <label className="flex flex-col gap-2 text-xs">
              Número de série (opcional)
              <input
                className={fieldClass}
                {...form.register("serialNumber")}
              />
            </label>
            <label className="flex flex-col gap-2 text-xs">
              Local de retirada (opcional)
              <input
                className={fieldClass}
                placeholder="Balcão · 2º andar"
                {...form.register("location")}
              />
            </label>
          </div>
          <fieldset className="flex flex-col gap-3">
            <legend className="pb-3 text-xs">Situação inicial</legend>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ["AVAILABLE", "Disponível"],
                  ["MAINTENANCE", "Em manutenção"],
                  ["OUT_OF_SERVICE", "Fora de uso"],
                ] as const
              ).map(([value, label]) => (
                <label
                  key={value}
                  className={cn(
                    "flex items-center gap-2 rounded-lg border px-3 py-2 text-xs",
                    values.status === value
                      ? "border-[var(--accent-700)] bg-[var(--accent-800)]"
                      : "border-[var(--border-strong)]",
                  )}
                >
                  <input
                    type="radio"
                    value={value}
                    {...form.register("status")}
                  />
                  {label}
                </label>
              ))}
            </div>
            <p className="text-xs text-[var(--text-muted)]">
              Manutenção não fica disponível. Fora de uso sai do catálogo.
            </p>
          </fieldset>
          <label className="flex flex-col gap-2 text-xs">
            Observações (opcional)
            <textarea
              className={cn(fieldClass, "min-h-[88px] resize-y")}
              {...form.register("notes")}
            />
          </label>
          {create.error && <Notice error>{create.error.message}</Notice>}
          {success && <Notice>{success}</Notice>}
          <div className="flex flex-wrap gap-3">
            <Button
              type="submit"
              className="min-h-11"
              disabled={create.isPending}
              onClick={() => setAnother(false)}
            >
              {create.isPending ? "Cadastrando…" : "Cadastrar"}
            </Button>
            <Button
              variant="secondary"
              type="submit"
              className="min-h-11"
              disabled={create.isPending}
              onClick={() => setAnother(true)}
            >
              Cadastrar e adicionar outro
            </Button>
          </div>
        </form>
        <aside className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <h2 className="text-[15px] font-semibold">Prévia no catálogo</h2>
            <article className={cn(panelClass, "flex flex-col gap-3 p-4")}>
              <div className="flex justify-between gap-2">
                <CategoryIcon category={values.category} />
                <EquipmentStatus status={values.status} />
              </div>
              <p className="text-sm font-semibold">
                {values.name || "Nome do equipamento"}
              </p>
              <p className="text-xs text-[var(--text-dim)]">
                {categoryLabels[values.category]} ·{" "}
                {values.patrimony || "PAT-0000"}
              </p>
              <p className="text-xs text-[var(--accent-400)]">
                {values.status === "AVAILABLE"
                  ? "Solicitar →"
                  : values.status === "MAINTENANCE"
                    ? "Indisponível para empréstimo"
                    : "Não aparece no catálogo"}
              </p>
            </article>
          </div>
          <h2 className="text-[15px] font-semibold">Últimos cadastros</h2>
          {recent.error ? (
            <Notice error>{recent.error.message}</Notice>
          ) : recent.data?.items.length ? (
            <div className="flex flex-col gap-3">
              {recent.data.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 border-b border-[var(--border-row)] pb-3"
                >
                  <CategoryIcon category={item.category} />
                  <div>
                    <p className="text-xs">{item.name}</p>
                    <p className="text-[11px] text-[var(--text-muted)]">
                      {item.patrimony} · {formatDate(item.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <SampleRecent />
          )}
        </aside>
      </div>
    </section>
  );
}
