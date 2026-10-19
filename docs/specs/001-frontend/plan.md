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

## Dependências e riscos

- Não há schema nem migrations no repositório. Qualquer persistência necessária exige DDL aprovado antes de gerar migration.
- Os comandos de desenvolvimento, teste e build ainda não foram validados nesta máquina.
- A confirmação de devolução exige um estado pendente no domínio; sua persistência depende da decisão de schema aprovada.


## Restrições que este plano obedece
- docs/adr/001-stack.md — stack
- docs/adr/002-design-system.md — tokens e componentes

## Como cada parte será feita
- <parte do plano>: skill <nome-da-skill> — atende CA-04 e CA-05
- <outra parte>: skill <outra-skill>
- Revisão de design antes do commit: skill <skill-de-revisao>

## Correção do build — Prisma Client ausente

Plano aprovado pelo usuário nesta conversa e aplicado em 19/10/2026 no repositório `heloisamdj/empresteti`, pasta `EmpresTI Helo/empresteti`.

- Adicionados `prisma` e `@prisma/client` 6.19.3, compatíveis com o schema atual, com lockfile atualizado.
- Build ajustado para `prisma generate && next build`.
- `npm run build`: passou, incluindo geração do cliente e checagem TypeScript.
- `npm run lint`: passou com um aviso preexistente de variável não utilizada em `docs/app.js`.
- Nenhum seed, migration, acesso ao banco remoto ou deploy foi executado.
