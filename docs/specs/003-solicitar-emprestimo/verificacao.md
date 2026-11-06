Revisão: f747a90739097b060e8916e73f46d2a5988c8025

| CA | evidência (arquivo:linha do teste) | status | observação |
| --- | --- | --- | --- |
| CA-01 | `tests/e2e/flows.spec.ts:74` | ATENDIDO | O teste usa uma sessão de colaborador e confere foto, nome, categoria e situação dos 12 patrimônios, com respostas de imagem interceptadas. `listEquipment` fornece as URLs que `CatalogScreen` renderiza. |
| CA-02 | `tests/integration/criteria.test.ts:252`, `tests/integration/loan-deadline.test.ts:4`, `tests/e2e/flows.spec.ts:160` | ATENDIDO | `requestLoan` grava o empréstimo e o prazo na mesma transação. O teste de calendário confere o fim do 14º dia útil em São Paulo. O fluxo no navegador confirma a data gravada em Meus empréstimos e a exclusão do item do filtro Só disponíveis. |
| CA-03 | `tests/e2e/flows.spec.ts:138`, `tests/integration/criteria.test.ts:206`, `tests/integration/criteria.test.ts:230`, `tests/e2e/flows.spec.ts:237` | ATENDIDO | `requestLoan` aceita cinco pedidos, recusa o sexto e bloqueia novo pedido com atraso mesmo abaixo do limite. A interface desabilita a solicitação e exibe o motivo nos dois casos. |
| CA-04 | `tests/e2e/flows.spec.ts:74`, `tests/integration/criteria.test.ts:319`, `tests/integration/criteria.test.ts:252`, `tests/e2e/flows.spec.ts:160` | ATENDIDO | O catálogo mostra TI-0004, TI-0007 e TI-0010 em manutenção, sem ação de solicitação nos cards. A integração verifica a recusa por manutenção e apenas um pedido aceito na disputa pelo mesmo item. O fluxo no navegador verifica que um item emprestado perde o link de solicitação e tem o botão desabilitado no detalhe. |
| CA-05 | `tests/integration/criteria.test.ts:252`, `tests/integration/criteria.test.ts:206` | ATENDIDO | Dois usuários disputam a mesma unidade e só um pedido é aceito. Seis pedidos simultâneos do mesmo usuário geram cinco registros. `requestLoan` bloqueia as linhas do vínculo e do equipamento, e `prisma/migrations/0002_return_request/migration.sql` mantém o índice único para empréstimo aberto por equipamento. |
| CA-06 | `tests/integration/criteria.test.ts:252`, `tests/e2e/flows.spec.ts:160` | ATENDIDO | `myLoans` filtra pelo usuário e pelo tenant da sessão. O teste confirma o prazo do empréstimo próprio, a lista vazia para outro usuário e a separação dos empréstimos do mesmo usuário entre tenants. O navegador confere a data exibida. |

Checks: npm run check:project → passou
Checks: npm run lint → passou
Checks: npm run typecheck → passou
Checks: npm test → passou
Checks: npm run build → passou
Checks: npm run test:e2e → passou
Checks: git diff --check → passou
Checks: git status --short → passou

A revisão foi estática. Os resultados dos checks para o SHA indicado foram recebidos no pacote, com referência ao job `validate` do PR #3. As observações de produção vieram do relato versionado em `docs/specs/003-solicitar-emprestimo/evidencia-producao.md`, que registra a demonstração com conta separada e zero empréstimos na conta do professor. [GitHub Actions](https://github.com/heloisamdj/empresteti/actions/runs/42216141846)

Em `MyLoansScreen`, a barra de prazo decorrido ainda atinge o máximo após 14 dias corridos e pode aparecer cheia enquanto o empréstimo está no prazo. A data exibida e a indicação de atraso usam o vencimento persistido. `src/components/screens.tsx`

Fora de escopo: nada encontrado
Veredito: PRONTA — Os seis critérios têm evidência nos testes revisados e os checks da revisão foram reportados como aprovados.
