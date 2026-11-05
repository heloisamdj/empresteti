# Verificação independente — 04/11/2026

Executada pelo subagente verificador-spec, conforme agents/verificador-spec.md, sobre os arquivos da implementação local no working tree. O verificador leu spec e código sem corrigir arquivos. Build e Playwright finais foram executados pelo principal e seus resultados repassados ao verificador, como indicado abaixo.

| CA | evidência (arquivo:linha do teste) | status | observação |
|---|---|---|---|
| CA-01 | tests/e2e/flows.spec.ts:57; tests/integration/auth-cookies.test.ts:20 | ATENDIDO | Login, redirecionamento e cookies verificados localmente; provedor simulado. Conta Supabase real não autenticada. |
| CA-02 | tests/integration/criteria.test.ts:64; tests/e2e/flows.spec.ts:72 | ATENDIDO | Situação, detalhe e isolamento comprovados. |
| CA-03 | tests/e2e/flows.spec.ts:113; tests/e2e/flows.spec.ts:311 | ATENDIDO | Fallback vazio identificado; erro não vira exemplo; exemplos não geram mutações. |
| CA-04 | tests/integration/criteria.test.ts:87; tests/integration/criteria.test.ts:106 | ATENDIDO | Limite concorrente de três itens e bloqueio por atraso. |
| CA-05 | tests/integration/criteria.test.ts:128; tests/e2e/flows.spec.ts:72 | ATENDIDO | Prazo persistido de 14 dias e exibido na confirmação. |
| CA-06 | tests/integration/criteria.test.ts:142; tests/e2e/flows.spec.ts:130 | ATENDIDO | Manutenção bloqueada na API e na interface. |
| CA-07 | tests/integration/criteria.test.ts:159; tests/e2e/flows.spec.ts:72 | ATENDIDO | Solicitação mantém empréstimo aberto e respeita isolamento. |
| CA-08 | tests/integration/criteria.test.ts:173; tests/e2e/flows.spec.ts:72 | ATENDIDO | Confirmação encerra empréstimo, libera item e registra auditoria. |
| CA-09 | tests/integration/criteria.test.ts:194; tests/e2e/flows.spec.ts:172 | ATENDIDO | MEMBER acessa Operações; anônimo é bloqueado. |
| CA-10 | tests/integration/criteria.test.ts:204; tests/e2e/flows.spec.ts:325 | ATENDIDO | Filtros, cursor e índice após confirmação verificados. |
| CA-11 | tests/integration/criteria.test.ts:256; tests/e2e/flows.spec.ts:172 | ATENDIDO | Cadastro, categorias, patrimônio, tenant e prévia reativa. |
| CA-12 | tests/e2e/flows.spec.ts:222; tests/components/ui.test.tsx:11 | ATENDIDO | Tema, navegação, cabeçalhos, datas, foco e movimento revisados; redução de movimento corrigida e retestada. |

Checks: `npm run check:project` → passou  
Checks: `npm run lint` → passou; aviso preexistente em docs/app.js:647  
Checks: `npm run typecheck` → passou  
Checks: `npm test` → passou; 19 testes, após repetir fora do sandbox devido a EPERM no cache  
Checks: `npm run build` → passou; execução final pelo principal  
Checks: `npm run test:e2e` → passou; 10 testes pelo principal  
Checks: E2E focado em CA-12 após correção final → passou; 1 teste, exit 0, pelo principal  
Checks: `git diff --check` → passou; informado pelo principal

Fora de escopo: nada encontrado. Publicação e login com conta Supabase real permanecem sem verificação.

Veredito: PRONTA — implementação local atende aos CA-01 a CA-12, sem autorização ou comprovação de publicação.

## Revisão complementar após as provas de skill

O verificador independente releu as correções posteriores de contagem de disponibilidade (CA-02), filtros, faixa de regras e foco (CA-12). Conferiu a contagem via banco filtrado por tenant e os testes de item emprestado/tenant sem equipamentos. Foram repetidos pelo principal: estrutura, lint sem erros (aviso preexistente), tipos, 19 Vitest, build e dez E2E; todos passaram. O teste `tests/e2e/flows.spec.ts:222` agora também confere chips, faixa, contagem e foco. O verificador não repetiu comandos nessa revisão somente leitura.

Veredito complementar: PRONTA — correções locais da spec aprovadas; este parecer não comprova publicação, integração remota ou login real no aplicativo.
