# Spec — Front-end da v1

## Objetivo

Entregar a interface do EmpresTI para substituir a planilha de empréstimos de equipamentos. A interface atende colaboradores e usuários de Operações no mesmo aplicativo.

## Escopo

- Login por e-mail e senha com Supabase Auth.
- Catálogo de equipamentos e detalhe de item.
- Solicitação de empréstimo de item disponível.
- Consulta dos empréstimos do usuário e solicitação de devolução.
- Operações: consulta de empréstimos em aberto, confirmação de devolução e cadastro de equipamento.
- Rotas: `/login`, `/catalogo`, `/catalogo/:patrimonio`, `/meus-emprestimos`, `/operacoes/emprestimos` e `/operacoes/equipamentos/novo`.
- Interface em português do Brasil, modo escuro e conforme `layout.md`.

## Fora de escopo

- Reserva com data futura.
- Notificação por e-mail.
- Importação da planilha atual.
- Tempo real.

## Dados e integração

- A interface consome dados e mutações exclusivamente por tRPC.
- Os serviços tRPC acessam o PostgreSQL do Supabase por Prisma.
- Não há acesso a dados pelo cliente do Supabase nem por Prisma em Server Components.
- Quando a consulta necessária de uma tela retornar vazia, a tela exibe os dados de exemplo definidos em `layout.md` como fallback temporário.
- Os exemplos não substituem dados retornados pela API.

## Acesso

- Todo usuário autenticado do tenant pode acessar as telas de Operações nesta versão.
- O tenant vem da sessão e nunca do input.

## Regras de negócio

- Uma pessoa pode ter no máximo três itens emprestados ao mesmo tempo.
- O prazo padrão é de 14 dias.
- Usuário com item em atraso não solicita novo empréstimo.
- Item em manutenção não aparece como disponível.
- A devolução solicitada pelo colaborador aguarda confirmação de Operações; só essa confirmação encerra o empréstimo.
- O cadastro aceita notebooks, monitores, cabos, câmeras, docks, adaptadores e projetores.

## Comportamento das telas

### Login

Mostra os campos de e-mail e senha e envia a autenticação pelo fluxo definido com Supabase Auth. Após autenticar, direciona o usuário ao catálogo.

### Catálogo

Mostra contagem, aviso de regras, filtros visuais, busca e cards de equipamentos. Um item disponível abre seu detalhe. Itens emprestados e em manutenção não oferecem solicitação.

### Detalhe do item

Mostra dados do equipamento, histórico e o resumo dos empréstimos do usuário. O pedido de empréstimo abre um diálogo de confirmação, calcula a data de devolução em 14 dias e respeita limite e bloqueio por atraso.

### Meus empréstimos

Mostra empréstimos em aberto, prazo e histórico. A ação de devolução registra uma solicitação pendente de confirmação por Operações; ela não encerra o empréstimo.

### Operações — empréstimos

Mostra empréstimos em aberto, métricas, filtros e paginação. Permite confirmar uma devolução pendente.

### Operações — cadastro de equipamento

Mostra formulário de cadastro, situação inicial, prévia do card e últimos cadastros. Equipamento em manutenção não aparece como disponível no catálogo.

## Critérios de aceite

- CA-01: usuário não autenticado vê a tela de login e usuário autenticado alcança o catálogo.
- CA-02: o catálogo mostra situação de cada equipamento e abre o detalhe de item disponível.
- CA-03: o catálogo mostra os exemplos do `layout.md` quando a consulta retorna vazia.
- CA-04: usuário com três itens ou item em atraso não consegue solicitar outro empréstimo.
- CA-05: uma solicitação aprovada mostra prazo de 14 dias.
- CA-06: equipamento em manutenção não aparece como disponível para solicitação.
- CA-07: colaborador vê seus empréstimos e solicita devolução sem encerrar o empréstimo.
- CA-08: Operações confirma a devolução pendente e encerra o empréstimo.
- CA-09: todo usuário autenticado do tenant acessa as telas de Operações.
- CA-10: Operações consulta empréstimos em aberto com filtros e paginação por cursor.
- CA-11: Operações cadastra equipamento nas categorias permitidas e vê a prévia do card.
- CA-12: todas as telas seguem o layout, paleta, navegação, textos e comportamento de movimento definidos em `layout.md`.

## Restrições técnicas

- Next.js App Router, TypeScript estrito, Tailwind CSS, shadcn/ui, TanStack Query via `@trpc/react-query`, React Hook Form e Zod.
- Client Components são o padrão para telas com dados.
- Mutação e leitura usam tRPC; Server Actions não são usadas.
- Procedimentos validam entrada com Zod e usam `protectedProcedure` ou `tenantProcedure` conforme necessário.
- Listas usam cursor e `useInfiniteQuery`.
- A camada segue Router tRPC → Service → Prisma.
- Os dados são isolados por `tenant_id` injetado pela sessão.
- Testes usam Vitest, Testing Library, Testcontainers com Postgres real, `createCaller` e Playwright conforme o ADR.
