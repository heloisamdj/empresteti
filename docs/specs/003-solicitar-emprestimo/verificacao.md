Revisão: 27598f89ffd3a4ac0d27b3a51fc7179345b08af7

| CA | evidência (arquivo:linha do teste) | status | observação |
| --- | --- | --- | --- |
| CA-01 | `tests/e2e/flows.spec.ts:74` | ATENDIDO | O catálogo de um colaborador autenticado exibe os 12 patrimônios com imagem, nome, categoria e situação. O teste usa imagens interceptadas e verifica a decodificação de uma delas. `src/server/services/equipment.ts` fornece as URLs e `src/components/screens.tsx` renderiza os cards. |
| CA-02 | `tests/integration/criteria.test.ts:252`, `tests/integration/loan-deadline.test.ts:4`, `tests/e2e/flows.spec.ts:160` | ATENDIDO | A confirmação grava o empréstimo imediatamente. O E2E verifica a data em Meus empréstimos e a exclusão do item do filtro de disponíveis. `src/server/services/loans.ts` usa o mesmo cálculo para previsão e gravação. O teste de prazo confere o fim do 14º dia útil em São Paulo, cruzando fins de semana e a virada de ano. |
| CA-03 | `tests/integration/criteria.test.ts:206`, `tests/integration/criteria.test.ts:230`, `tests/e2e/flows.spec.ts:138` | ATENDIDO | Cinco pedidos são aceitos e o sexto é recusado com mensagem visível na interface. Um empréstimo vencido bloqueia outro pedido com vagas disponíveis. O serviço e a tela de detalhe aplicam os bloqueios em `src/server/services/loans.ts` e `src/components/screens.tsx`. |
| CA-04 | `tests/e2e/flows.spec.ts:74`, `tests/e2e/flows.spec.ts:160`, `tests/integration/criteria.test.ts:319`, `tests/integration/criteria.test.ts:252` | ATENDIDO | TI-0004, TI-0007 e TI-0010 aparecem em manutenção e sem ação no catálogo. O detalhe desabilita a solicitação de um item emprestado. O servidor rejeita manutenção e impede uma segunda abertura para o mesmo equipamento. `src/components/screens.tsx`, `src/server/services/loans.ts`. |
| CA-05 | `tests/integration/criteria.test.ts:206`, `tests/integration/criteria.test.ts:252` | ATENDIDO | A disputa de dois usuários pelo mesmo equipamento produz um empréstimo. Seis pedidos simultâneos do mesmo usuário produzem cinco. `src/server/services/loans.ts` serializa os pedidos por vínculo e por equipamento, e `prisma/migrations/0002_return_request/migration.sql` garante a unicidade do empréstimo aberto. |
| CA-06 | `tests/integration/criteria.test.ts:252`, `tests/e2e/flows.spec.ts:160` | ATENDIDO | A consulta retorna os empréstimos abertos do titular com o prazo gravado e separa usuários do mesmo tenant e empréstimos do mesmo usuário em tenants diferentes. A tela exibe as datas de retirada e de devolução prevista. `src/server/services/loans.ts`, `src/server/db.ts`, `src/components/screens.tsx`. |

Checks: npm run check:project → passou
Checks: npm run lint → passou
Checks: npm run typecheck → passou
Checks: npm test → passou
Checks: npm run build → passou
Checks: npm run test:e2e → passou
Checks: git diff --check → passou
Checks: git status --short → passou

Conferi estaticamente as fontes do snapshot. Os resultados dos checks e a árvore limpa foram informados no pacote. `tests/helpers/database.ts` configura PostgreSQL descartável. A demonstração com a conta de teste é evidência complementar registrada em `docs/specs/003-solicitar-emprestimo/evidencia-producao.md`. A barra “Prazo decorrido” em `src/components/screens.tsx` ainda satura após 14 dias corridos, embora a data exibida e a situação usem o vencimento gravado. [Job validate do PR #3](https://github.com/heloisamdj/empresteti/actions/runs/42215078089)

Fora de escopo: nada encontrado no fluxo da spec 003. O diff também inclui a carga e as fotos da spec 002 e a infraestrutura de verificação da prática.

Veredito: PRONTA — Os seis critérios da spec 003 têm evidência nos testes e os oito checks da revisão foram reportados como aprovados.
