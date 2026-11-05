# Acesso de produção preparado

Destino autorizado pelo usuário: Supabase pkncugbogwvxyulbngjr e Vercel empresteti-hzyj. O projeto voltou a Healthy e o editor não mostrou tabelas/views no schema public. O login empresti_v1 autenticou na conexão de sessão em 05/11/2026, com os grants de criação ainda pendentes.

## Credencial proposta

Criar o login PostgreSQL `empresti_v1`, com senha forte gerada para essa finalidade. Sem superuser, criação de banco, criação de outros roles, replicação ou bypass de RLS. Permitir conexão ao banco postgres e criação/uso de objetos exclusivamente em public; as tabelas criadas pelas migrations pertencem a esse login. O usuário postgres mantém a administração via membership nesse role, conforme a orientação de integração Prisma do Supabase.

Não alterar a senha ou propriedades do login postgres existente. Não conceder acesso a auth, storage ou outros schemas. Não sobrescrever role já existente com esse nome.

Preparação operacional de permissões, após criar o role pelo painel (sem senha nesse SQL):

```sql
GRANT CONNECT ON DATABASE postgres TO empresti_v1;
GRANT USAGE, CREATE ON SCHEMA public TO empresti_v1;
GRANT empresti_v1 TO postgres;
ALTER ROLE empresti_v1 CONNECTION LIMIT 10;
```

O teste em PostgreSQL descartável identificou que o primeiro `CREATE SCHEMA IF NOT EXISTS public` da migration 0001 exige `CREATE` **no banco atual**, mesmo sem criar outro banco. Conceder esse privilégio somente durante o job e revogá-lo como administrador antes da verificação/publicação. A capacidade de criar bancos/roles permanece desabilitada. O preflight da Vercel deve recusar promoção enquanto esse privilégio temporário não for revogado.

```sql
-- Somente durante a aplicação inicial pelo Prisma:
GRANT CREATE ON DATABASE postgres TO empresti_v1;
-- Após o job, antes da publicação:
REVOKE CREATE ON DATABASE postgres FROM empresti_v1;
```

## Armazenamento e execução

- Arquivo local ignorado, sem divulgar valores no chat/Git.
- Vercel: atualizar DATABASE_URL, DIRECT_URL, NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY do projeto autorizado.
- GitHub heloisamdj/empresteti: guardar somente as duas conexões como secrets EMPRESTI_DATABASE_URL e EMPRESTI_DIRECT_URL para o job de migrations.
- Runtime: pooler de transações :6543; migration: conexão :5432 apropriada para Prisma, verificando mesmo banco/schema/referência. Host confirmado no Connect: aws-0-sa-east-1.pooler.supabase.com.
- Job GitHub Actions, conforme ADR-001 §9, depende dos testes e exige push deliberado na branch fix/prisma-build com marcador [migrate-db]. Não dispara em PR ou em pushes comuns.
- Apenas Prisma Migrate aplica as migrations versionadas 0001/0002 e o seed idempotente do tenant suporte_ti. Não há reset; schema não vazio sem histórico é recusado.
- Após o job e o preflight aprovados, criar prévia sem promover, conferir saúde/rotas/login real e promover para o domínio existente da Vercel.

O plano não cria conta de aplicação, não envia convite e não copia dados de outro projeto Supabase. Se for necessário convidar alguém, identificar o usuário e obter a autorização correspondente.
