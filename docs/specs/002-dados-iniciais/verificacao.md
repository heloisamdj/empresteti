Revisão: 27598f89ffd3a4ac0d27b3a51fc7179345b08af7

| CA | evidência (arquivo:linha do teste) | status | observação |
| --- | --- | --- | --- |
| CA-01 | `tests/integration/criteria.test.ts:23` | ATENDIDO | O teste executa a carga de `scripts/prepare-practice-data.mjs`, compara os 12 patrimônios, nomes, categorias e situações com o inventário e verifica zero empréstimos após a primeira execução. |
| CA-02 | `tests/integration/criteria.test.ts:23` | ATENDIDO | A segunda execução preserva os 12 patrimônios, o estado alterado, os empréstimos ativo e histórico e o vínculo único do professor. `docs/specs/002-dados-iniciais/operacao.md` registra a conferência de 12 fotos nos caminhos esperados após a repetição da carga. O objeto adicional foi identificado como marcador de pasta vazio. |
| CA-03 | `tests/integration/criteria.test.ts:23` | ATENDIDO | O teste usa um manifesto sintético e verifica a aceitação da carga e a rejeição de manifesto sem aprovação ou de outro provedor. `skills/imagens-equipamentos/scripts/fotos.mjs` verifica dimensões e unicidade por ID e hash. `docs/specs/002-dados-iniciais/revisao-fotos.md` registra a decodificação dos 12 WebP em 800 × 600, as origens, os autores, a licença, os hashes e a aprovação visual. O manifesto final é local e a evidência fornecida é o registro versionado da revisão. |
| CA-04 | `tests/e2e/flows.spec.ts:74` | ATENDIDO | O E2E intercepta o Storage e verifica os 12 elementos de imagem e o link do crédito no catálogo. `src/components/screens.tsx` também renderiza o crédito no detalhe com foto. `docs/specs/002-dados-iniciais/revisao-fotos.md` registra HTTP 200 sem sessão para as 12 URLs públicas. |
| CA-05 | `tests/integration/criteria.test.ts:23` | PENDENTE | O teste simula a identidade confirmada e verifica o vínculo `MEMBER` em `suporte_ti` e zero empréstimos. A responsável confirmou esses dados em produção e usou uma conta separada para a demonstração. O HTTP 200 da página de login comprova que ela está acessível. Falta a confirmação de que o professor conseguiu autenticar-se no site publicado com sua própria conta. |

Checks: npm run check:project → passou
Checks: npm run lint → passou
Checks: npm run typecheck → passou
Checks: npm test → passou
Checks: npm run build → passou
Checks: npm run test:e2e → passou
Checks: git diff --check → passou
Checks: git status --short → passou

A revisão estática conferiu as fontes do snapshot. Os resultados dos checks e as evidências de produção foram recebidos no pacote. Os testes de banco fornecidos usam PostgreSQL descartável via Testcontainers. [Job validate do PR #3](https://github.com/heloisamdj/empresteti/actions/runs/42215078089)

Fora de escopo: nada encontrado na implementação da spec 002.
Veredito: NÃO PRONTA — O CA-05 aguarda a confirmação do primeiro acesso do professor ao site publicado.
