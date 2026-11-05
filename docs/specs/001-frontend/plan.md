# Plano — Front-end da v1

## Restrições do ADR-001

- A aplicação é um monolito Next.js com App Router; telas com dados usam Client Components.
- Leituras e mutações passam por tRPC, com TanStack Query no cliente.
- O acesso a dados segue Router → Service → Prisma, com Zod, tipos inferidos e `tenant_id` vindo da sessão.
- Supabase Auth usa cookies `httpOnly` via `@supabase/ssr`.
- Prisma Migrate é o dono único do schema; toda mudança de schema exige procedimento próprio antes da implementação.
- Listas usam cursor; não há Server Actions nem acesso de dados pelo cliente do Supabase.

## Estratégia

1. Preparar a base do projeto Next.js com a stack definida no ADR e as variáveis de ambiente já documentadas no repositório.
2. Criar o shell visual e os componentes reutilizáveis do layout antes das telas.
3. Implementar autenticação, contexto, routers tRPC, services e persistência necessária, seguindo o procedimento de schema aplicável.
4. Implementar as telas em ordem de fluxo: login, catálogo, detalhe, meus empréstimos e Operações.
5. Aplicar fallback de exemplos por tela apenas quando a consulta correspondente retornar vazia.
6. Cobrir os critérios de aceite com testes de componente, procedimento, integração e E2E.

## Execução solicitada em 04/11/2026

O usuário solicitou conferir as atividades dos HTMLs e executar o que faltasse na cópia EmpresTI Helo/empresteti. A referência publicada é https://empresteti-hzyj.vercel.app/. Não foi solicitado publicar ou alterar o banco remoto.

- Schema inicial preservado; migration 0002 adiciona solicitação de devolução, integridade de tenant, datas e exclusividade de empréstimo aberto por equipamento (CA-04/05/07/08).
- Router valida entradas e encaminha aos Services; tenantProcedure injeta o banco filtrado e a identidade resolvida pela sessão (CA-01 a CA-11).
- Supabase Auth somente no servidor e tokens em cookie httpOnly; associação local user/membership é necessária, sem cadastro remoto automático (CA-01/09).
- Catálogo e Operações usam useInfiniteQuery com cursor; exemplos são identificados e nunca usados em mutações (CA-02/03/10).
- As seis telas mantêm os tokens Nocturne e recebem estados de erro, carregamento, vazio, foco e adaptação móvel (CA-12).
- Testcontainers recria PostgreSQL isolado e aplica todas as migrations; createCaller verifica regras e isolamento. Playwright usa o mesmo router e banco real, com apenas o provedor de identidade substituído no ambiente de teste.

## Dependências externas

- As URLs PostgreSQL do .env apontam para localhost:5433. A ligação TCP direta ao Supabase remoto não pode ser demonstrada sem a configuração remota correspondente.
- O Supabase do link enviado posteriormente possui referência diferente da configuração local. Por orientação do usuário, a cópia local e a Vercel continuam sendo a fonte correta; não se troca de projeto automaticamente.
- Login real exige conta convidada e vínculo no banco utilizado. A saúde HTTP do Auth não substitui essa prova.
- Vercel ainda serve a versão inicial: publicar requer etapa própria, revisão e configuração remota. Nenhum push/deploy faz parte desta execução local.


## Restrições que este plano obedece
- docs/adr/001-stack.md — stack
- docs/adr/002-design-system.md — tokens e componentes

## Como cada parte será feita
- Front-end e revisão visual: skill frontend-design adaptada, respeitando os ADRs — CA-02/03/07/09/10/11/12.
- Backend e schema: procedimentos migration, secrets e tests; a skill visual não é carregada para essas tarefas.
- Verificação final: agents/verificador-spec.md, com spec e lista completa de arquivos alterados, sem permissão para corrigir.

## Correção do build — Prisma Client ausente

Plano aprovado pelo usuário nesta conversa e aplicado em 19/10/2026 no repositório `heloisamdj/empresteti`, pasta `EmpresTI Helo/empresteti`.

- Adicionados `prisma` e `@prisma/client` 6.19.3, compatíveis com o schema atual, com lockfile atualizado.
- Build ajustado para `prisma generate && next build`.
- `npm run build`: passou, incluindo geração do cliente e checagem TypeScript.
- `npm run lint`: passou com um aviso preexistente de variável não utilizada em `docs/app.js`.
- Nenhum seed, migration, acesso ao banco remoto ou deploy foi executado.
