# Prova do verificador da prática

A branch local `prova/verificador-spec` isolou a falha do trabalho de entrega. O commit `9de0065422ab92558dd2994927a4f68f5f6aad43` alterou `MAX_ITEMS` de 3 para 4 na base histórica da spec 001. O commit `e7e0af6ba54550a2b08e376170377a170f8eef5c` reverteu a falha. `git diff --exit-code e61c776 HEAD` passou na branch de prova após a reversão.

| Revisão | CA | Evidência | Resultado devolvido pelo verificador |
| --- | --- | --- | --- |
| `9de0065` | CA-04 | `tests/integration/criteria.test.ts:87`, `src/lib/contracts.ts:76` | REPROVADO. A mutação aplica o limite quando a contagem chega a quatro, permitindo o quarto pedido com três empréstimos em dia. |
| `e7e0af6` | CA-04 | `tests/integration/criteria.test.ts:87` e `:106` | ATENDIDO na revisão estática. O limite de três voltou e o bloqueio por atraso segue presente. |

O controle estático falhou com o erro plantado e passou após a reversão. As rodadas cobriram somente CA-04. O verificador não declarou a spec pronta porque os checks completos e os demais CAs não foram avaliados nessas rodadas.

A primeira tentativa de ler arquivos via shell foi bloqueada pelo sandbox no Windows. O procedimento corrigido passou ao verificador o conteúdo versionado da revisão, em uma sessão nova com shell, apps, plugins e aprovações desativados. Os checks são executados pelo principal ou pelo CI e enviados como evidência. A regra de independência fica em `agents/verificador-spec.md` e a checagem do parecer fica em `scripts/check-spec-review.mjs`.

O gate foi testado em repositório descartável. Rejeitou parecer ausente, reprovado, obsoleto e tag de entrega incompleta. Aceitou parecer válido referente ao conteúdo revisado. A prova não configurou proteção de branch no GitHub.

A regressão do gate pode ser repetida com
`node --test scripts/check-spec-review.test.mjs`. O teste exige as duas specs
mesmo no modo PR, recusa check avulso, referência fora da declaração do teste,
teste da outra spec e parecer que só existe na árvore de trabalho. Também
confere os modos PR e entrega com pareceres completos e reprova mudança
posterior no código.
