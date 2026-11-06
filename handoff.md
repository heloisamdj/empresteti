# Handoff — prática SDD

## Revisão pós-entrega

- Branch local `revisao/pos-entrega`, criada do merge `ad2626b`. A `main`, a tag `entrega-pratica` e a Vercel já servem a entrega com os checks verdes. O diff local corrige documentação e a barra de prazo. Sem migration nem alteração de dados.
- Verificação local do diff: check:project, lint, tipos, 21 testes Vitest, build, 12 testes Playwright e git diff --check passaram. O lint manteve um aviso antigo em docs/app.js.
- A estudante aprovou a spec 004 e o plano. O diff local aplica aos novos empréstimos os feriados nacionais, estaduais e municipais de São Paulo capital, com preservação dos prazos gravados. O histórico da conta do professor, a ordem real dos trabalhos e a limitação de proteção da main estão registrados no `ENTREGA.md`.
- Confira os checks da spec 004 e o parecer independente antes de preparar a integração.

1. A primeira validação em produção usou o deploy dpl_ACVkuZAwg78M4gDueceHpSJ47quY, commit d4e95c5 da branch pratica/sdd-subagentes, enquanto o PR #3 estava em rascunho.
2. Enunciado: pratica-sdd-subagentes.html. A estudante aprovou as specs 002 e 003, cinco empréstimos, 14 dias úteis em São Paulo e TI-0004/TI-0007/TI-0010 em manutenção.
3. Verificador nativo e gate: e61c776 e 291efd7. Prova 9de0065 reprovou CA-04. Reversão e7e0af6 corrigiu a falha. 9b417df incorporou os dois commits ao histórico sem alterar a árvore.
4. Skill imagens-equipamentos: fc08575. Vínculos de descoberta locais no repo e na pasta de trabalho. Simulação produziu 12 WebP de 800 × 600, repetiu sem mudar hashes e rejeitou conteúdo duplicado.
5. Specs e planos aprovados em 714840a. Dados iniciais e integração local de foto em db7aeef. Regra de empréstimo em a2f1c63. Migration 0003 aplicada no Postgres local e no Supabase pela responsável, sem alterações locais de schema fora do Git.
6. Revisão 27598f8 corrige a delegação da sessão isolada. O job validate do PR #3 passou no run 42216141846 na revisão f747a90 com estrutura, lint, tipos, Vitest, build e Playwright. As specs 002 e 003 receberam PRONTA nessa revisão.
7. Pixabay substituiu Pexels no commit adf6b6f. O passo 2 preparou os 12 WebP de 800 × 600 e conferiu IDs, créditos e hashes. A responsável aprovou a prancha em 05/11/2026, e a aprovação consta no manifesto local.
8. Migration 0003 confirmada no run 42087414691. A carga repetida manteve 12 equipamentos e 12 fotos públicas com hashes conferidos. O 13º objeto é um marcador vazio do painel. No domínio público, a conta de teste chegou a cinco empréstimos com prazo em 25/11 e o sexto foi recusado. Em 06/11 a responsável devolveu os cinco pelo app. A consulta em leitura confirmou nove itens disponíveis e zero empréstimos do professor.
9. A conta do professor está confirmada no Auth e vinculada como colaborador. A responsável informou em 06/11 que ela própria conferiu o acesso pelo domínio público. A demonstração de empréstimos usou conta separada. Registre a procedência do relato e respeite a reserva da conta ao professor.
10. Fase 1: gate exige duas specs, oito checks e linhas de testes identificados. Teste descartável e Playwright com URL fictícia passaram. API GitHub confirmou que main está desprotegida por limitação de plano no repositório privado. Operacao.md registra a conferência manual dos checks no PR e a promoção humana da candidata.
11. A responsável integrou o PR #3 com merge commit. A tag entrega-pratica aponta para ad2626b e o run 42245872178 aprovou os checks. A Vercel confirmou o deploy de empresteti-hzyj e a conexão com o banco.
