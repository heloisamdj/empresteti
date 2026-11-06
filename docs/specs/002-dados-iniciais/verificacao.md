Revisão: f747a90739097b060e8916e73f46d2a5988c8025

| CA | evidência (arquivo:linha do teste) | status | observação |
| --- | --- | --- | --- |
| CA-01 | `tests/integration/criteria.test.ts:23` | ATENDIDO | O teste executa a carga de `scripts/prepare-practice-data.mjs` em PostgreSQL descartável e compara os 12 patrimônios, nomes, categorias e situações com a lista da prática. A primeira execução deixa zero empréstimos. |
| CA-02 | `tests/integration/criteria.test.ts:23` | ATENDIDO | A segunda execução mantém os 12 patrimônios, o estado alterado de um equipamento, os empréstimos existentes e um único vínculo do professor. `docs/specs/002-dados-iniciais/operacao.md` documenta o reaproveitamento de objetos pelo caminho e hash e a conferência de 12 fotos após a repetição da carga em produção. O objeto adicional era um marcador vazio do painel. |
| CA-03 | `tests/integration/criteria.test.ts:23` | ATENDIDO | O teste exercita a validação do manifesto com dados sintéticos. `skills/imagens-equipamentos/scripts/fotos.mjs` verifica as dimensões após decodificar o WebP e rejeita conteúdo repetido por hash. `docs/specs/002-dados-iniciais/revisao-fotos.md` registra a aprovação visual, os 12 IDs, as fontes, os autores, a licença e os hashes do lote aprovado de 800 × 600. |
| CA-04 | `tests/e2e/flows.spec.ts:74` | ATENDIDO | O E2E verifica as 12 imagens do catálogo com respostas interceptadas e o link de crédito para o Pixabay. `src/components/screens.tsx` também renderiza o crédito no detalhe com foto. `docs/specs/002-dados-iniciais/revisao-fotos.md` registra HTTP 200 sem sessão e coincidência de hash nas 12 URLs públicas. |
| CA-05 | `tests/integration/criteria.test.ts:23` | ATENDIDO | O teste vincula um UID confirmado simulado como `MEMBER` em `suporte_ti` e verifica zero empréstimos. `docs/specs/002-dados-iniciais/operacao.md` atribui à responsável o relato de login bem-sucedido no site publicado e registra a consulta posterior com zero empréstimos do professor. A demonstração usou uma conta separada. |

Checks: npm run check:project → passou
Checks: npm run lint → passou
Checks: npm run typecheck → passou
Checks: npm test → passou
Checks: npm run build → passou
Checks: npm run test:e2e → passou
Checks: git diff --check → passou
Checks: git status --short → passou

O verificador inspecionou a spec, o plano, as tarefas, o diff e as fontes versionadas fornecidas. Os resultados dos checks e a árvore limpa foram informados no pacote para o SHA indicado. A conferência do lote publicado, do manifesto aprovado e do acesso do professor se baseia nos registros operacionais fornecidos. [GitHub Actions, job validate do PR #3](https://github.com/heloisamdj/empresteti/actions/runs/42216141846)

Fora de escopo: o diff inclui mudanças de limite e prazo cobertas pela spec 003 e infraestrutura de verificação da prática. Na implementação da spec 002, nada encontrado.

Veredito: PRONTA — Os cinco critérios têm evidência nos testes identificados e nos registros operacionais aplicáveis, com os oito checks informados como aprovados para a revisão.
