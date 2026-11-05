# Auditoria das entregas — 04/11/2026

Escopo solicitado: conferir as atividades dos HTMLs aplicáveis ao EmpresTI e executar as pendências já definidas no PRD, nos ADRs e na spec 001. Os exercícios DQ, pontos, carrinho e turnover são projetos didáticos independentes: não entram no produto EmpresTI.

## Inventário inicial

| Aula/entrega | Evidência inicial | Pendência |
|---|---|---|
| 1–3: contexto, AGENTS, rules e handoff | AGENTS.md, rules/ e handoff.md existentes | Atualizar fatos, comandos e ponto de continuidade após execução |
| 4: PRD e ADRs | PRD e ADR-001/002 existentes | Preservar decisões e distinguir motivos registrados de interpretação |
| 5–6: execução, limites e SDD | restrictions.md e spec/plano/tarefas existentes | Aplicar os limites à execução real; não tratar intenção como evidência |
| 7: spec → plano → tarefas → código | docs/specs/001-frontend/ | Integração e testes CA-01…12 ausentes |
| 8: fatia zero, banco, migrations, configuração | Next, schema e migration existentes | Provar banco local do zero e caminho tela → tRPC → Prisma → PostgreSQL |
| 9: oito regras e comandos reais | Cinco arquivos em rules/ | migration, secrets, operacao e comandos/checks executáveis |
| 10: skill auditada, ativação e acesso externo | frontend-design adaptada | Registrar auditoria e provas; não conectar MCP sem servidor/conta necessários |
| 11: verificador-spec | Arquivo e ponteiros locais existentes | Executar revisão independente com evidências |
| Produto: seis telas e regras | Protótipo em docs/, shell Next | Implementar API, autenticação e persistência; preservar PRD |

## Execução

O pedido atual autoriza completar as pendências dentro das decisões existentes. Trabalho local, em etapas verificáveis, sem push/deploy ou escrita no Supabase remoto. O PostgreSQL do projeto de MLOps na porta 5432 será preservado.

1. Preparar dependências do ADR e comandos de validação.
2. Completar a persistência da devolução pendente e as garantias de integridade; migration aditiva local, sem editar a migration inicial.
3. Implementar autenticação Supabase somente no servidor, cookies httpOnly, contexto e isolamento por tenant; leituras/mutações pelo tRPC.
4. Implementar as seis telas seguindo a skill frontend-design, os tokens e a spec; exemplos identificados e sem ações que gravem dados fictícios.
5. Provar regras e isolamento com PostgreSQL real; testar navegação e componentes; lint, tipos, build.
6. Completar instruções de operação com fatos verificados, revisar CA por CA e registrar o que depender de acesso externo.

## DDL necessário para a spec existente

- loans.return_requested_at TIMESTAMP(3), anulável: distingue a solicitação da confirmação de devolução (CA-07/08).
- Índice único parcial em loans(equipment_id) WHERE returned_at IS NULL: impede dois empréstimos abertos do mesmo item.
- CHECK: confirmação de devolução exige solicitação prévia e datas coerentes.
- Trigger de integridade: equipamento e usuário de um empréstimo devem pertencer ao tenant indicado.
- RLS existente continua habilitado; nenhuma permissão pública é adicionada.

São detalhes de execução dos comportamentos já aprovados na spec, sem nova política de negócio. Aplicação e teste somente no banco local isolado.

## Pendências que não podem ser simuladas como concluídas

- Publicação e configuração do Supabase remoto/Vercel: fora desta execução local.
- Login contra conta real: depende de usuário convidado existente e associação user/membership; não criar contas remotas automaticamente.
- MCP: só ligar um servidor após identificar necessidade, credenciais e escopo. A aula pede auditoria do que for ligado; não autoriza instalar qualquer integração.

As provas de ativação de skill em sessões novas, propostas na aula 10, não foram repetidas em sessões independentes. Há auditoria e uso real da skill visual nesta execução; isso não equivale àquelas provas isoladas. Não há MCP conectado para auditar/provar: CLI e consultas HTTP cobriram os diagnósticos disponíveis, conforme a própria orientação da aula de não conectar quando um CLI resolve.

Os resultados da execução estão abaixo. A revisão independente confirmou checks locais e 19 testes, foi interrompida pelo limite de uso e retomou após o usuário pedir continuidade. Build e Playwright foram executados pelo principal; o verificador recebeu os resultados, releu o código e os testes finais sem corrigir arquivos.

## Conexões conferidas

- Fonte correta confirmada pelo usuário: repositório local EmpresTI Helo/empresteti e https://empresteti-hzyj.vercel.app/.
- Git remoto: https://github.com/heloisamdj/empresteti.git. Branch de trabalho existente: fix/prisma-build; nenhum push nesta execução.
- Vercel, consulta pública GET: `/` responde 200 e exibe o placeholder do catálogo; `/login`, `/catalogo` e `/api/trpc/health` respondem 404. A versão integrada local ainda não está publicada.
- `.env` original preservado. Ele aponta Auth para fobuhqvjheblmwbiwera.supabase.co e PostgreSQL para localhost:5433.
- Auth desse endereço respondeu HTTP 200. Os metadados OpenAPI da API foram lidos sem consultar registros; não expuseram as sete tabelas esperadas do EmpresTI. Isso não é uma inspeção de todos os schemas do banco.
- O link Supabase enviado aponta a pkncugbogwvxyulbngjr, diferente do `.env`. Não foram reutilizadas chaves do projeto antigo nesse endereço nem trocada a configuração automaticamente.
- A consulta autenticada ao painel pelo navegador foi interrompida pela ferramenta por não conseguir verificar a URL no Windows. Nenhuma navegação posterior foi tentada. Não foi possível verificar variáveis privadas da Vercel nem obter conexão PostgreSQL pelo painel.

## Resultado dos checks locais

- Migrations 0001 e 0002 aplicadas no PostgreSQL local; seed de suporte_ti executado.
- `npm run check:project`: passou; estrutura, oito regras e fronteiras básicas.
- `npm run lint`: passou, sem erros; um aviso preexistente de variável não usada em docs/app.js:647.
- `npm run typecheck`: passou.
- `npm test`: 19 testes aprovados em três arquivos; PostgreSQL real via Testcontainers, componentes e adaptador SSR/cookies. Uma tentativa no sandbox falhou ao gravar cache do Vite; repetida com permissão de execução, passou com exit 0.
- `npm run build`: passou no estado final (Next 16.4.5), incluindo TypeScript, seis rotas de tela e API tRPC.
- `npm run test:e2e`: dez testes aprovados contra o build de produção local, PostgreSQL descartável e router/services reais.
- Após a revisão corrigir a especificidade CSS de redução de movimento, novo build passou e `npm run test:e2e -- --grep test_ca_12_telas` passou (um teste). Verifica botão habilitado pressionado com e sem redução de movimento, além de tema, foco, cabeçalhos e adaptação móvel.
- `git diff --check`: passou; avisos de conversão LF/CRLF do Git não são erros de conteúdo.
- Revisão visual da tela de cadastro pelo screenshot de teste: tokens, hierarquia, prévia e layout confirmados. Evidência de navegador não é prova de login remoto.
- Atualização Next 16.3.6 → 16.4.5, mesma versão principal, após avisos de segurança do npm. Prisma permanece na linha 6 definida no projeto; não foi feita migração arquitetural para Prisma 7.

## Correções encontradas pela conferência

Além da integração ausente, foram corrigidos: devolução sem estado pendente, paginação dos históricos, índice da última página de Operações após confirmação, fallback vazio que tinha condição impossível, datas fora de dd/mmm, cabeçalhos/contexto de busca e movimentos definidos no layout. A revisão independente identificou também o conflito de especificidade que mantinha deslocamento no modo de redução de movimento; a regressão agora tem teste de botão habilitado.

## Alcance da evidência

O verificador independente aprovou CA-01 a CA-12 para a implementação local. Tabela, evidências e veredito em [verificacao.md](specs/001-frontend/verificacao.md). Essa aprovação não cobre publicação nem login numa conta real.

Os E2E interceptam o endpoint no navegador e usam o adaptador HTTP do tRPC para chamar o router real com contexto de teste. Assim exercitam telas, procedimentos, Services, Prisma e PostgreSQL, mas não comprovam a montagem real de sessão/tenant no Route Handler contra uma conta Supabase. O teste SSR separado verifica escrita httpOnly, validação e encerramento com respostas do provedor simuladas. O teste CSRF chama o Route Handler real. Não há bypass de autenticação de teste no código do aplicativo.

Por isso, aprovação local dos CA não significa integração remota ou publicação pronta. Permanecem: login real com usuário convidado e vínculo no banco utilizado; conexão PostgreSQL do Supabase correto; variáveis privadas/deploy da Vercel; provocações isoladas da skill em sessões novas. Nenhuma chave privada foi impressa e nenhum push, deploy ou migration remota foi executado.
