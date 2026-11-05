Revisão: 2f4b44f9979ad4455ddd963ae34415dc88709543

| CA | evidência (arquivo:linha do teste) | status | observação |
|---|---|---|---|
| CA-01 | `tests/e2e/flows.spec.ts:74`, `tests/integration/criteria.test.ts:22` | SEM TESTE | O teste da spec 003 verifica 12 cards com imagens interceptadas, o carregamento de uma foto e o filtro. A comparação de nomes, categorias e situações ocorre na carga, em teste identificado com a spec 002. Falta verificar esses campos nos 12 cards em teste identificado com o CA da spec 003. A conferência do catálogo publicado está PENDENTE. |
| CA-02 | `tests/e2e/flows.spec.ts:148`, `tests/integration/loan-deadline.test.ts:4`, `tests/integration/criteria.test.ts:245` | ATENDIDO | O fluxo local verifica criação imediata, exclusão do item do filtro e exibição do prazo persistido em Meus empréstimos. A integração verifica o cálculo em dias úteis com o calendário de São Paulo. |
| CA-03 | `tests/e2e/flows.spec.ts:126`, `tests/e2e/flows.spec.ts:221`, `tests/integration/criteria.test.ts:199`, `tests/integration/criteria.test.ts:224` | ATENDIDO | Cinco pedidos são aceitos e o sexto é recusado com mensagem na interface. A integração confirma o bloqueio por atraso mesmo com vagas. |
| CA-04 | `tests/e2e/flows.spec.ts:74`, `tests/e2e/flows.spec.ts:148`, `tests/e2e/flows.spec.ts:221`, `tests/integration/criteria.test.ts:22`, `tests/integration/criteria.test.ts:245`, `tests/integration/criteria.test.ts:309` | ATENDIDO | Os testes cobrem bloqueios por manutenção e empréstimo aberto no servidor e na interface. O teste de carga confirma os três patrimônios em manutenção inicial. |
| CA-05 | `tests/integration/criteria.test.ts:199`, `tests/integration/criteria.test.ts:245` | ATENDIDO | A disputa pelo mesmo equipamento entre usuários distintos persiste um empréstimo. Seis pedidos concorrentes do mesmo usuário persistem cinco. |
| CA-06 | `tests/integration/criteria.test.ts:245`, `tests/e2e/flows.spec.ts:148` | ATENDIDO | A integração verifica titularidade, prazo e isolamento entre usuários e tenants. O fluxo local confirma a exibição da data persistida. |

Checks: `npm run check:project` → passou (resultado recebido)  
Checks: `npm run lint` → passou (resultado recebido, com aviso preexistente em `docs/app.js`)  
Checks: `npm run typecheck` → passou (resultado recebido)  
Checks: `npm test` → passou (21 testes, resultado recebido)  
Checks: `npm run build` → passou (resultado recebido)  
Checks: `npm run test:e2e` → passou (12 testes, resultado recebido)  
Checks: `git diff --check` → passou (resultado recebido)  
Checks: `git status --short` → pendente (resultado obrigatório ausente)

**Fora de escopo** — O parecer usa trechos selecionados e referências recebidas, sem leitura integral, execução de checks ou confirmação do SHA via Git. Os testes usaram PostgreSQL descartável e, no Playwright, contexto de autenticação simulado e imagens interceptadas. O material recebido não inclui diff ou base para atribuir alterações em devolução ou Operações à spec 003.

**Veredito** — Aprovação retida pela lacuna de evidência do CA-01 e pelo check de estado da árvore pendente. A validação em produção permanece PENDENTE. A triagem registrou nove WebP de 800 × 600 com hashes conferidos e reprovou TI-0007, TI-0011 e TI-0012 por marcas ou texto. Permanecem pendentes a aprovação humana do lote, o upload, a carga, o provisionamento do professor, o deploy e a validação do fluxo publicado após a spec 002.
