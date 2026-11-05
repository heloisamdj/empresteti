# EmpresTI Helo — execução e verificação

Referência indicada pelo usuário: este repositório e [o site da Vercel](https://empresteti-hzyj.vercel.app/). O site publicado ainda é a base inicial; as alterações desta entrega são locais.

## Ambiente local

Requer Node.js 24, Docker em execução e as variáveis públicas do Supabase Auth já presentes no `.env`. Não copie credenciais para o chat nem sobrescreva o `.env` existente.

```text
npm ci
npm run db:up
npm run db:migrate
npm run db:seed
npm run dev
```

O aplicativo abre em http://localhost:3000. A conexão local é definida no `.env.local`, ignorado pelo Git, e usa PostgreSQL exclusivo na porta 5433. O banco de MLOps na porta 5432 não é alterado.

O seed cria apenas o tenant suporte_ti. Para entrar com uma conta real, ela precisa existir por convite no Supabase Auth e ter associação no banco usado pelo app. Depois de obter o ID do usuário convidado pelo procedimento administrativo do projeto:

```text
npm run db:provision -- <ID-do-usuario-convidado> <email> "Nome"
```

Esse comando só cria o vínculo local; não cria contas remotas e bloqueia conexões fora de localhost. Não existe login de demonstração no app. Dados de exemplo são identificados e não podem gerar empréstimos fictícios.

## Checks

```text
npm run check:project
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
```

Vitest/Testcontainers e Playwright usam PostgreSQL descartável, com migrations do zero. Os E2E interceptam as chamadas do navegador para executar o adaptador HTTP do tRPC com router, Services e banco reais, usando um contexto de identidade de teste. A montagem real do contexto no Route Handler contra o Supabase não é comprovada por essa interceptação. O teste do adaptador SSR verifica cookies com respostas HTTP do provedor simuladas; o teste CSRF chama o Route Handler real. Nenhum desses testes comprova login numa conta Supabase real.

No Windows, execute testes e build em sequência: a DLL do Prisma fica bloqueada enquanto houver processo usando o cliente. Playwright usa o Edge instalado no Windows; no Linux/CI, instale Chromium com `npx playwright install --with-deps chromium`.

## Supabase e Vercel

```text
npm run check:supabase
node scripts/check-deployment.mjs https://empresteti-hzyj.vercel.app/
```

O primeiro comando não imprime credenciais. Confere saúde de Auth, metadados da API sem ler registros e, quando houver URL remota válida, SELECT 1. O segundo consulta apenas páginas públicas da Vercel.

O `.env` existente aponta Auth para fobuhqvjheblmwbiwera, enquanto o link de painel enviado aponta a pkncugbogwvxyulbngjr. Por orientação do usuário, a cópia local e a Vercel são prioritárias. Não foi feita troca de projeto nem reaproveitamento de chave em outro endereço.

`DATABASE_URL` e `DIRECT_URL` existentes são locais. Para produção, a pessoa responsável deve conferir as conexões do projeto correto e as variáveis privadas na Vercel, revisar a migration e só então autorizar a publicação. Este trabalho não executa push/deploy nem migrations remotas.

## Decisões e auditoria

- `docs/PRD.md`: negócio, preservado.
- `docs/adr/`: decisões técnicas, preservadas.
- `docs/specs/001-frontend/`: comportamento, plano e tarefas.
- `docs/auditoria-aulas.md`: conferência das entregas e conexões.
- `docs/auditoria-skills-mcp.md`: skill visual e inventário MCP (sem servidor conectado).
- `handoff.md`: estado de continuidade.
