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

Após essa conferência, o usuário autorizou explicitamente reativar e integrar **pkncugbogwvxyulbngjr**, preservando o código local e o site empresteti-hzyj da Vercel. O painel confirmou a restauração e depois o estado **Healthy**. O Table Editor mostrou public sem tabelas/views. A URL e a chave pública do novo projeto foram registradas em arquivo ignorado pelo Git. Auth respondeu HTTP 200.

O teste local descartável validou as duas migrations e o seed com LOGIN e sem superuser, CREATEDB, CREATEROLE, replicação ou bypass de RLS. As sete tabelas ficaram com RLS. A primeira migration exige CREATE no banco atual. O plano concede esse privilégio só durante a execução inicial e exige sua revogação antes da publicação. Detalhes em `plano-acesso-producao.md`.

## Estado em 05/11/2026

O usuário autorizou o acesso técnico e o armazenamento das conexões. A leitura do painel logo após salvar foi interrompida pelo limite da revisão automática. Na retomada, os poolers de sessão e de transação confirmaram o login empresti_v1 no banco postgres do projeto autorizado. A consulta retornou CREATE falso no schema public e no banco, nenhuma relação em public e nenhum privilégio administrativo no role. O GitHub Actions recebeu os dois secrets autorizados via API, com HTTP 201 para cada um. O run 41957007293 concluiu a validação do commit 1479d23 com sucesso.

Na retomada, a CLI da Vercel confirmou a autenticação de heloisamdj. O projeto empresteti-hzyj recebeu as quatro variáveis autorizadas. Cada uma permaneceu como sensitive nos ambientes Production e Preview, conforme o escopo já existente. A regra .vercelignore passou a excluir explicitamente .vercel/.

O painel do Supabase havia informado sessão expirada e agora fica na tela de carregamento, inclusive na rota de entrada. As permissões do schema e as migrations remotas estão pendentes.

A implantação candidata dpl_9FgLL6STXuhUnNXF8fRSVYByLeDE está READY, criada com `--prod --skip-domain`. O build abriu os dois poolers do Supabase autorizado e encontrou public vazio e as migrations 0001_init e 0002_return_request pendentes. A candidata está protegida por Vercel Authentication. O domínio público ainda não está associado a ela.

## Publicação concluída

O run 42012172978 aplicou 0001_init e 0002_return_request. Os dois poolers confirmaram as sete tabelas com RLS, o tenant suporte_ti e a revogação de CREATE no banco antes da promoção. A implantação dpl_9FgLL6STXuhUnNXF8fRSVYByLeDE foi promovida ao domínio principal. A rota de saúde respondeu HTTP 200 com banco conectado. O navegador redirecionou o catálogo para o login e a API recusou a consulta sem sessão com HTTP 401. O login com conta real ainda não foi exercitado. A skill frontend-design está ativa e as duas provas independentes foram concluídas. Detalhes em auditoria-skills-mcp.md.
