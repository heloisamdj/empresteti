# EmpresTI

Sistema que substitui a planilha de controle de empréstimo de equipamentos internos (notebooks, monitores, cabos, câmeras). Atende dois perfis: Colaborador — que consulta o catálogo, solicita itens e registra devolução — e Operações — que cadastra equipamentos e acompanha todos os empréstimos em aberto.

Negócio em `docs/PRD.md`. Stack decidida em `docs/adr/001-stack.md`.

---

## Onde olhar

- `docs/PRD.md` — problema, quem usa, escopo e regras de negócio da v1. Não é spec técnica.
- `docs/adr/` — decisões de arquitetura e stack já tomadas, com justificativa.
- `docs/specs/<NNN-funcionalidade>/` — spec, plano e tarefas; a v1 está em `001-frontend/`.
- `docs/design-system.md` — tokens; `docs/layout.md` e `layout.md` — composição das seis telas. Nocturne, somente modo escuro. Divergências históricas estão em `docs/auditoria-aulas.md`.
- `rules/` — como se trabalha aqui. Leia `rules/restrictions.md` sempre.
- `docs/auditoria-aulas.md` — pendências das aulas, escopo e resultados da conferência.

---

## Comandos

- rodar o projeto: `npm run dev`
- rodar os testes: `npm test` (Vitest/Testcontainers), `npm run test:e2e` (Playwright/PostgreSQL real)
- conferir tipos: `npm run typecheck`; lint: `npm run lint`; estrutura: `npm run check:project`
- banco local: `npm run db:up`, `npm run db:migrate`, `npm run db:seed`
- buildar: `npm run build` (gera o Prisma Client e executa o build do Next.js)

No Windows, encerre testes/servidores que estejam usando Prisma antes de gerar seu cliente no build. Evidências atualizadas em `docs/auditoria-aulas.md`.

---

## Ambiente

- Arquitetura de produção: PostgreSQL/Supabase. Desenvolvimento e testes usam PostgreSQL local, conforme rules/restrictions.md; `.env.local` sobrescreve a conexão para a porta 5433.
- Supabase Auth é verificado no servidor. As variáveis SUPABASE_URL/SUPABASE_ANON_KEY e os nomes públicos já existentes são aceitos; nenhuma service_role é usada pelo app cliente.
- Deploy: Vercel, ligada ao repositório remoto. Push na branch principal publica.
- Variáveis de ambiente: ver `.env.example`. Nunca use prefixo `NEXT_PUBLIC_` para segredos; a `service_role` key do Supabase só pode aparecer em código de servidor.

---

## Arquitetura em uma linha

Next.js (App Router) · tRPC · Prisma · Supabase Auth + PostgreSQL · Tailwind · shadcn/ui — monolito, repositório único, deploy único na Vercel.

---

## Padrões que não se negocia

- **Camadas**: Router tRPC → Service → Prisma. Regra de negócio fica no Service; o Router cuida de entrada, contexto e permissão.
- **Validação**: Zod no `.input()` de todo procedimento tRPC, sem exceção.
- **Acesso a dado**: exclusivamente via tRPC. Não buscar dado direto pelo Prisma em Server Components nem pelo cliente do Supabase.
- **Mutação**: exclusivamente via tRPC. Não usar Server Actions.
- **Tenant**: sempre injetado pelo `tenantProcedure` a partir da sessão, nunca lido do input.
- **Schema**: Prisma Migrate é o único dono. Não rodar comandos do Supabase CLI que alterem schema.
- **Tipos**: `RouterInputs` e `RouterOutputs` inferidos do `AppRouter`; nunca declarar tipo de retorno de procedimento à mão.
- **TypeScript**: modo `strict`. Sem `any` implícito.
- **Autorização**: usar `protectedProcedure`, `tenantProcedure` ou `adminProcedure` conforme o caso. RLS existe como defesa adicional, não como autorização primária.

---

## Testes

- Runner: Vitest (servidor e componentes).
- Banco nos testes de integração: Testcontainers com Postgres real. Não mockar o Prisma.
- Procedimentos: testados via `createCaller` com contexto montado à mão.
- E2E: Playwright.
- Obrigatório por procedimento: um caso de isolamento de tenant (tenant A não enxerga dado de tenant B).
- Sem meta de cobertura por percentual; caminhos críticos são obrigatórios.

---
## Skills
- Ficam em skills/<nome>/SKILL.md.
- No início de cada tarefa, leia só o frontmatter (name e description)
  de cada skill. Carregue o corpo do SKILL.md apenas quando a tarefa
  casar com a description; abra references/ só quando o SKILL.md mandar.
- Em conflito, rules/ e docs/adr/ vencem qualquer skill.
- Descoberta nativa no Codex: `.agents/skills/frontend-design` é um vínculo local para `skills/frontend-design`, sem segunda cópia. `allow_implicit_invocation: true`; o scanner confirmou `enabled: true`. O template não é ativado.
---

## Precedência

Se dois artefatos discordarem sobre comportamento, a spec (`docs/specs/`) vence o código.
Se algo não estiver escrito em lugar nenhum, pergunte — não decida.

---

## Procedimentos

- Sempre: `rules/restrictions.md` e `rules/operacao.md`.
- Feature: `rules/spec-flow.md`; schema: `rules/migration.md`; configuração: `rules/secrets.md`.
- Testes: `rules/tests.md`; antes de pronto: `rules/checks.md`; fim de tarefa: `rules/handoff.md`.
- MCP: `.mcp.json` está vazio; não há conexão presumida. Auditoria em `docs/auditoria-skills-mcp.md`.

## Subagentes
- Ficam em agents/<nome>.md. O frontmatter diz quando delegar; o
  corpo é a instrução completa do subagente.
- Subagente não herda esta conversa: ao delegar, passe tudo que o
  arquivo dele pede como entrada.
- Se o harness não tiver subagentes, abra uma sessão nova e comece
  com: "Aja conforme agents/<nome>.md." e as entradas pedidas.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
