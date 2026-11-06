# Entrega da prática SDD

**Estado: prática publicada e duas specs aprovadas pelo verificador.**

## Links

- [Repositório EmpresTI](https://github.com/heloisamdj/empresteti), monolito Next.js com tRPC. A prática está na branch `pratica/sdd-subagentes` e no [PR #3](https://github.com/heloisamdj/empresteti/pull/3).
- [Produção na Vercel](https://empresteti-hzyj.vercel.app/). A prática foi promovida a partir do commit `d4e95c5`. A rota de saúde confirmou banco conectado.
- [Tag de entrega](https://github.com/heloisamdj/empresteti/tree/entrega-pratica), criada após conferir o CI e integrar o PR.

## 1. Conflitos

| Pedido | Fonte em conflito | Decisão e motivo | Evidência | Commit |
| --- | --- | --- | --- | --- |
| Limite de cinco | PRD e spec 001 usavam três | A estudante priorizou o briefing novo. Serviço, interface e checks seguem a spec 003. | [Spec 003](docs/specs/003-solicitar-emprestimo/spec.md) e [checklist](rules/checks.md) | `714840a`, `a2f1c63` |
| Prazo de 14 dias úteis | Código anterior somava 14 dias corridos | A estudante aprovou dias úteis e preservação dos prazos gravados anteriormente. | [Spec 003](docs/specs/003-solicitar-emprestimo/spec.md) e [cálculo](src/server/services/loan-deadline.ts) | `714840a`, `a2f1c63` |
| Só dois itens em manutenção | A lista obrigatória inclui TI-0010 | A estudante escolheu a lista literal, com três em manutenção e nove disponíveis. | [Inventário](skills/imagens-equipamentos/assets/equipamentos.json) e [spec 002](docs/specs/002-dados-iniciais/spec.md) | `fc08575`, `714840a` |
| Instalar sharp | ADR-001 e regras de dependências | Reutilizar Chromium do Playwright. O canvas produz WebP e a decodificação confirma a dimensão de saída. | [Script da skill](skills/imagens-equipamentos/scripts/fotos.mjs) | `fc08575` |
| Catálogo sem créditos | Contrato da skill pede atribuição | Mostrar link “Fotos: Pixabay” onde as fotos aparecem e registrar os autores no manifesto. | [Tela](src/components/screens.tsx) e [teste E2E](tests/e2e/flows.spec.ts) | Histórico iniciado em `db7aeef` |
| Pexels como fonte original | Atualização da prática comunicada pela estudante | Usar a API do Pixabay, guardar o cache de buscas por 24 horas e servir os arquivos pelo Storage. | [Spec 002](docs/specs/002-dados-iniciais/spec.md) e [fluxo](skills/imagens-equipamentos/references/fluxo.md) | `adf6b6f`, `2f4b44f` |
| Senha no arquivo da carga | Regras de segredos e prática | O responsável configura a senha no Auth. A carga exige a conta confirmada e cria o vínculo de negócio. | [Operação](docs/specs/002-dados-iniciais/operacao.md) | `714840a`, `db7aeef` |
| Verificador corrige teste quebrado | Independência exigida pela prática | O verificador aponta a falha e o agente principal corrige. O ambiente da revisão tem shell e integrações desativados. | [Contrato](agents/verificador-spec.md) e [prova](docs/prova-verificador-pratica.md) | `e61c776`, `291efd7` |

## 1b. Lacunas

| Spec | O que faltava | Alternativas | Decisão e motivo | Commit |
| --- | --- | --- | --- | --- |
| 002 | Como lidar com carga repetida e cadastro antigo | Sobrescrever a linha ou validar a identidade | Preservar o estado operacional. Completar foto ausente em cadastro compatível e abortar em colisões. | `714840a`, `db7aeef` |
| 002 | Como representar Cabo quando já existia Acessório | Reutilizar a categoria genérica ou acrescentar Cabo | Acrescentar Cabo para representar a lista e manter Acessório válido para os demais registros. | `714840a`, `db7aeef` |
| 002 | Como identificar arquivos e créditos | Caminho fixo por patrimônio ou caminho por patrimônio e hash | Usar hash para permitir reaproveitamento verificável e versionamento de troca de foto. | `fc08575`, `714840a` |
| 003 | Dia inicial, feriados, fuso e vencimento | Incluir o dia do pedido ou começar no seguinte, usar calendário civil ou corporativo | A estudante aprovou contar a partir do dia seguinte, de segunda a sexta em São Paulo, até o fim do 14º dia útil. A prática não fornece calendário corporativo. | `714840a`, `a2f1c63` |

## 2. Onde o agente tentou decidir

O agente recomendou manter o limite de três e os dias corridos por serem o comportamento existente. A estudante indicou que a atividade nova tem prioridade e aprovou as duas specs com cinco empréstimos e 14 dias úteis. A convenção para feriados e horário de vencimento foi proposta separadamente, porque o briefing não a detalha.

## 3. Decisão sobre ADR

O redimensionamento poderia usar uma biblioteca nativa de imagem ou o Playwright que já faz parte do projeto. O plano aprovado reutiliza o Chromium em um script local. A escolha fica na spec e no contrato da skill porque não muda a arquitetura, as dependências do aplicativo ou o fluxo de produção. Trocar o mecanismo de persistência de fotos seria outra decisão, pois afetaria o modelo de dados e a publicação.

## 4. Skill de imagens

O [SKILL.md](skills/imagens-equipamentos/SKILL.md) orienta o agente e exige aprovação antes de encerrar a seleção. A [referência](skills/imagens-equipamentos/references/fluxo.md) concentra o procedimento de busca, atribuição e entrega ao operador. O [script](skills/imagens-equipamentos/scripts/fotos.mjs) controla origem, dimensões, IDs, hashes e manifesto porque são propriedades verificáveis automaticamente. A responsável revisa pessoas, marcas, textos e conteúdo de tela na imagem final. A skill termina na preparação dos arquivos locais, e a publicação no Storage é feita pela responsável.

O teste local inicial simulou respostas e gerou 12 WebP de 800 × 600, com a mesma saída na repetição e rejeição de conteúdo duplicado. Na busca real, sete candidatos foram reprovados após inspeção em 800 × 600 por marca ou texto. As três substituições no lote foram para TI-0007, TI-0011 e TI-0012. Os arquivos finais foram decodificados, e seus IDs, hashes e créditos foram conferidos. A responsável aprovou o lote em 05/11/2026. [Revisão das fotos](docs/specs/002-dados-iniciais/revisao-fotos.md) · [Documentação do Pixabay](https://pixabay.com/api/docs/)

## 5. Subagente

O [papel nativo](.codex/agents/verificador-spec.toml) é acionado após as tarefas da spec e antes da decisão de aceitar o trabalho. Nesse ponto ele pode cruzar cada critério com o código final e os checks da mesma revisão. O [executor](scripts/review-spec.mjs) prepara um pacote com a spec, o plano, as tarefas, os testes e as fontes versionadas. O subagente herda somente a mensagem da sessão nova que contém esse pacote. Assim, os critérios e resultados observados são rastreáveis e ficam separados da conversa de quem implementou. Como o projeto é monolítico, o mesmo pacote cobre tela, API e persistência. O principal ou o CI executa os testes com PostgreSQL descartável.

A execução usa sandbox de leitura e desativa shell, apps, plugins e aprovações. A rodada final recebe também o diff da base escolhida. O [gate no CI](.github/workflows/checks.yml) verifica o parecer no PR da branch da prática e na tag. Exige as duas specs, todos os checks e uma referência a teste de cada CA. Também confere que a revisão corresponde aos arquivos entregues. A proteção do GitHub e a sequência da candidata na Vercel estão no [roteiro de operação](docs/specs/002-dados-iniciais/operacao.md).

## 6. Verificador em ação

- [Prova de erro plantado e revertido](docs/prova-verificador-pratica.md), commits `9de0065` e `e7e0af6`.
- [Parecer da spec 002](docs/specs/002-dados-iniciais/verificacao.md).
- [Parecer da spec 003](docs/specs/003-solicitar-emprestimo/verificacao.md).

Na revisão local `a2f1c63`, a verificação de estrutura, o lint com um aviso preexistente, a checagem de tipos, os **21 testes Vitest**, o build e os **12 testes Playwright** passaram. A primeira rodada de navegador identificou que a política de segurança bloqueava fotos do Storage. O ajuste restringiu a liberação ao caminho do bucket do projeto. O reteste carregou as fotos e conferiu o crédito.

O parecer da revisão `a2f1c63` apontou testes incompletos na carga e no fluxo de solicitação. Os testes agora comparam todos os patrimônios com a lista, verificam que a carga preserva empréstimos antigos e em aberto, verificam a data e o filtro no navegador e garantem o isolamento para a mesma identidade em dois tenants. A revisão local com Pixabay passou novamente os 21 testes Vitest e os 12 Playwright. A primeira tentativa do novo teste de histórico falhou porque a massa de teste não registrava a solicitação de devolução antes da devolução. O dado de teste foi corrigido para respeitar a restrição existente.

Na rodada `2f4b44f`, o verificador aprovou os critérios locais de empréstimo CA-02 a CA-06. As correções e comprovações dos itens retidos ficaram assim.

| Spec e critério | Motivo registrado pelo verificador | Correção ou evidência |
| --- | --- | --- |
| 002 CA-02 | A repetição local não demonstrava os objetos do Storage publicado. | A responsável repetiu a carga e conferiu os 12 caminhos esperados e o marcador vazio do painel. [Operação](docs/specs/002-dados-iniciais/operacao.md) |
| 002 CA-03 | Três patrimônios ficaram sem fotos aceitáveis após reprovação por marca ou texto. | Substituição e revisão do lote final, com 12 fotos distintas e seus hashes. [Triagem](docs/specs/002-dados-iniciais/revisao-fotos.md) · `4c2fab0` |
| 002 CA-04 | O teste usava respostas interceptadas e as fotos reais ainda estavam fora do bucket. | Conferência anônima das 12 URLs publicadas e conferência do crédito no catálogo. [Triagem](docs/specs/002-dados-iniciais/revisao-fotos.md) |
| 002 CA-05 | A evidência anterior usava uma identidade sintética. | A responsável provisionou o professor. A conferência real encontrou identidade confirmada, vínculo de colaborador e zero empréstimos. A demonstração autenticada usou conta separada. [Operação](docs/specs/002-dados-iniciais/operacao.md) |
| 003 CA-01 | Faltavam asserções de nome, categoria e situação dos 12 cards no navegador. | Asserções acrescentadas ao cenário do catálogo. [Teste](tests/e2e/flows.spec.ts#L74) · `2d53297` |

Na revisão `27598f8`, o job `validate` passou com os testes e a build. O verificador aprovou os seis critérios da spec 003. Na spec 002, registrou quatro critérios atendidos e manteve o CA-05 pendente de evidência do login. Depois dessa rodada, a responsável informou que ela própria conferiu o login do professor. O enunciado reserva essa conta ao professor. A demonstração de empréstimos usou a conta separada, e o professor segue com zero empréstimos. [Execução do CI](https://github.com/heloisamdj/empresteti/actions/runs/42215078089) · [Operação](docs/specs/002-dados-iniciais/operacao.md)

Na revisão `f747a90`, o verificador aprovou os cinco critérios da spec 002 e os seis da spec 003. O job `validate` passou com a mesma revisão. [Execução do CI](https://github.com/heloisamdj/empresteti/actions/runs/42216141846) · [Parecer 002](docs/specs/002-dados-iniciais/verificacao.md) · [Parecer 003](docs/specs/003-solicitar-emprestimo/verificacao.md)

## 7. Regra posta à prova

O verificador deveria rodar testes e também operar em leitura. Testes e build gravam artefatos, e o teste de integração inicia banco descartável. A revisão separou os papéis. O executor local ou o CI roda os checks, e o verificador avalia o código e os resultados da revisão exata sem executar comandos. A primeira tentativa via shell confirmou a necessidade dessa separação no Windows. [Fluxo SDD](rules/spec-flow.md) · [Contrato](agents/verificador-spec.md)

## 8. O que ficou de fora e o que faria diferente

- Importação da planilha, redesenho do catálogo, reservas, notificações e renovação ficaram fora do escopo. A responsável usou o fluxo existente de devolução para liberar os cinco itens da demonstração. A consulta de leitura em 06/11/2026 confirmou cinco devoluções registradas, nove itens disponíveis e zero empréstimos do professor. [Spec 002](docs/specs/002-dados-iniciais/spec.md) · [Spec 003](docs/specs/003-solicitar-emprestimo/spec.md)
- Em outra entrega, eu simularia as permissões do SQL Editor antes da primeira carga. A tentativa inicial encontrou tabelas da migration pertencentes ao papel de aplicação. A segunda carga precisou tratar a associação temporária de papéis na mesma transação. [Operação](docs/specs/002-dados-iniciais/operacao.md)
- A barra de prazo decorrido ainda usa a escala anterior de 14 dias corridos. A data exibida e o bloqueio de atraso usam o prazo persistido conforme a spec. Uma revisão visual futura pode calcular o preenchimento pelo intervalo entre a retirada e o vencimento de cada empréstimo. [Tela Meus empréstimos](src/components/screens.tsx#L831) · [Cálculo de prazo](src/server/services/loan-deadline.ts)
- A API do GitHub confirmou que o plano atual impede a proteção da `main` neste repositório privado. O CI roda o gate no PR e na tag, e a integração depende da conferência dos checks pela responsável. [Fluxo de operação](docs/specs/002-dados-iniciais/operacao.md)
