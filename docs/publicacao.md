# Publicação e integração — 04/11/2026

O usuário autorizou publicar as alterações na Vercel, integrar o Supabase e ativar as skills. Autorizou também consultar somente DATABASE_URL, DIRECT_URL e URL/chave pública do Supabase para essa finalidade. Essas autorizações substituem o limite de execução exclusivamente local da etapa anterior; não autorizam reset de banco, troca arbitrária de projeto ou exposição de credenciais.

## Referência e versão

- Repositório: heloisamdj/empresteti; branch fix/prisma-build.
- Commits publicados na branch: f66add3 (v1) e 1a31b67 (guardas da publicação), após rebase sobre origin/main.
- Projeto Vercel confirmado por inspeção do domínio: empresteti-hzyj, ID prj_zaWeyVUhtZaqE4GH8SOfl6N4AsWm, equipe helo-98ee.
- Domínio principal: https://empresteti-hzyj.vercel.app/. Não foi promovido para a nova implementação.
- Ajustes de layout/contagem descobertos na prova da skill foram corrigidos. Estrutura, lint (aviso preexistente), tipos, 19 Vitest, build e dez E2E passaram novamente. Asserções adicionais comprovam contagem por tenant/disponibilidade, chips, faixa e foco.

## Acessos e limites

O usuário concluiu o login oficial da Vercel pelo navegador. A consulta dos nomes confirmou as cinco variáveis anteriores; o aplicativo usa quatro, sem service_role no cliente. A revisão automática rejeitou o download indiscriminado de variáveis. O usuário autorizou as quatro específicas, mas a API informou `type: sensitive`, sem valor recuperável. Não se tentou contornar essa proteção: as credenciais ficam na Vercel e são utilizadas apenas pelo job autorizado, sem exportação.

O job explícito `scripts/deploy-database.mjs` tem modos verify/migrate. Não roda no boot do aplicativo. Migrate só aceita o job GitHub Actions autorizado; verify aceita esse job ou o projeto Vercel exato. Valida o Supabase pkncugbogwvxyulbngjr, mesmo banco/schema public e role empresti_v1 sem privilégios administrativos nas duas conexões, histórico e checksums (aceitando somente diferença LF/CRLF). Antes da primeira migration, inventaria relações, funções e tipos para não substituir objetos existentes. Não executa reset. Arquivos .env e vínculos locais ficam fora do upload por .vercelignore.

O ADR-001 §9 é preservado: o job migrate-production foi preparado no GitHub Actions após validate, usando somente as duas conexões como secrets. Exige push deliberado em fix/prisma-build com marcador [migrate-db], sem execução em PR/push comum; tem concorrência exclusiva e token contents:read. O modo migrate na Vercel é recusado. Nenhum ADR foi alterado e nenhuma migration remota foi executada.

## Tentativas verificadas

1. dpl_341pp6rRWFBgYudrpPqXrb3vwSs4: bloqueada antes do build por autoria Git não associada. Novo commit usou o endereço noreply da conta GitHub verificada; configuração global do Git preservada.
2. dpl_8feLse9Sxk7RbLf74f3qe1xr8xbS: build Next passou; o preflight recusou a conexão com a mensagem “A conexão não aponta ao Supabase”. Não executou migration e não houve promoção do domínio principal.
3. dpl_Y9nw82zoHN3WwpLFqrWgRGK8v87q: diagnóstico somente leitura confirmou `authProject: fobuhqvjheblmwbiwera`, `configuredRuntimeHost: localhost` e `configuredDirectHost: localhost`. O job recusou essas conexões antes de conectar/aplicar migrations. A configuração de produção contém URLs de desenvolvimento local; é necessário substituí-las pelas conexões do Supabase correto. Não foram impressos usuários, senhas ou chaves.

O controle nativo do Chrome foi interrompido porque a ferramenta não conseguia verificar a URL. Na tentativa seguinte, o navegador integrado funcionou e o usuário concluiu o login. A conta heloisamdj mostrou uma organização e um projeto: EmprestimoTi, pkncugbogwvxyulbngjr, pausado e associado a heloisamdj/emprestimoTI (outro repositório, diferente do código atual). O antigo fobuhqvjheblmwbiwera não apareceu nessa conta.

Após essa conferência, o usuário autorizou explicitamente reativar e integrar **pkncugbogwvxyulbngjr**, preservando o código local e o site empresteti-hzyj da Vercel. O painel confirmou a restauração e depois o estado **Healthy**. O Table Editor mostrou public sem tabelas/views. A URL/chave pública do novo projeto foram capturadas sem consultar a chave secreta, em arquivo .vercel ignorado; Auth respondeu HTTP200. As conexões/Vercel ainda precisam ser atualizadas após criar/configurar a credencial técnica, cuja confirmação foi solicitada e continua pendente.

O formulário do role empresti_v1 está preparado, ainda não salvo. O teste local descartável validou ambas as migrations e seed com LOGIN e sem superuser/CREATEDB/CREATEROLE/replicação/bypassRLS; sete tabelas com RLS. Identificou que a primeira migration precisa de CREATE no banco atual, concedido temporariamente e revogado antes do seed. O preflight de publicação recusa esse privilégio em qualquer das duas conexões enquanto não for revogado. Plano revisável em `plano-acesso-producao.md`.

## Próximas ações

Conferir no projeto correto as conexões PostgreSQL, atualizar somente as configurações necessárias da Vercel, repetir o preflight, aplicar migrations pelo procedimento resolvido, verificar saúde e login real e promover a versão ao domínio principal. Skills já foram ativadas e as duas provas independentes concluídas; detalhes em auditoria-skills-mcp.md.
