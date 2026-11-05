Revisão: 2f4b44f9979ad4455ddd963ae34415dc88709543

| CA | evidência (arquivo:linha do teste) | status | observação |
|---|---|---|---|
| CA-01 | `tests/integration/criteria.test.ts:22` | ATENDIDO | A carga local em PostgreSQL descartável produziu exatamente os 12 patrimônios com os nomes, categorias e situações esperados e zero empréstimos. A execução da carga real segue pendente. |
| CA-02 | `tests/integration/criteria.test.ts:22` | PENDENTE | A reexecução local preservou os equipamentos, o estado alterado, os empréstimos existentes e o vínculo único do professor sintético. O teste verificou 12 caminhos distintos. Falta comprovar que a reexecução não duplica objetos no Storage. |
| CA-03 | `tests/integration/criteria.test.ts:22` | REPROVADO | O teste usa um manifesto sintético. A triagem real validou nove WebP de 800×600 e seus hashes. As fotos de TI-0007, TI-0011 e TI-0012 foram reprovadas por marca ou texto. O manifesto real segue parcial e sem aprovação em `docs/specs/002-dados-iniciais/revisao-fotos.md:22`. |
| CA-04 | `tests/e2e/flows.spec.ts:74` | PENDENTE | O E2E verifica as 12 URLs e o crédito com link para o Pixabay usando imagens interceptadas. Falta testar o acesso anônimo às URLs após o upload, conforme `docs/specs/002-dados-iniciais/operacao.md:5`. |
| CA-05 | `tests/integration/criteria.test.ts:22` | PENDENTE | O teste verifica UID confirmado sintético, vínculo `MEMBER` no tenant `suporte_ti` e zero empréstimos do professor. O E2E usa Marina como identidade de teste. Falta provisionar a conta real e verificar seu login no ambiente publicado. |

Os resultados abaixo vieram dos extratos do pacote, sem reexecução independente.

Checks: `npm run check:project` → passou  
Checks: `npm run lint` → passou com aviso preexistente em `docs/app.js`  
Checks: `npm run typecheck` → passou  
Checks: `npm test` → passou, 21 testes  
Checks: `npm run build` → passou  
Checks: `npm run test:e2e` → passou, 12 testes com Supabase Auth e imagens interceptados no navegador de teste  
Checks: `git diff --check` → passou  
Checks: `git status --short` → pendente, resultado não informado

Fora de escopo

Os extratos mostram que os componentes existentes receberam foto e crédito e preservam o ícone quando falta foto. O cadastro pela interface já consta no snapshot e contempla a categoria Cabo prevista na spec. A ausência de um diff com a base limita a confirmação de mudanças em cadastro pela interface, importação de planilha e redesenho. Prazo, sexto empréstimo e isolamento da mesma identidade em dois tenants pertencem à spec 003.

Veredito: NÃO PRONTA. Três fotos precisam ser substituídas e o manifesto final precisa de aprovação. A carga real e sua reexecução, o acesso anônimo às imagens e o login do professor no ambiente publicado seguem pendentes.
