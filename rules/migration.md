# Alteração de schema
> leitor: agente

## Quando
Ao alterar prisma/schema.prisma ou qualquer migration.

## Procedimento
1. Leia ADR-001 e a spec; descreva DDL, integridade e impacto antes da aplicação.
2. Preserve migrations já existentes. Crie migration nova com SQL revisável.
3. Inclua RLS deny by default em tabela nova, na mesma migration.
4. Aplique somente no PostgreSQL local exclusivo: `npm run db:migrate`.
5. Execute `npm test`: Testcontainers recria o banco descartável do zero.

## Verificação
Migrations aplicadas em banco novo e testes de acesso aprovados.

## Não faça
- Não aplique SQL pelo painel ou pelo MCP; Prisma Migrate é o dono.
- Não rode reset/migrate em banco remoto ou no boot do aplicativo.
