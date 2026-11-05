# Handoff — prática SDD

1. Base de produção anterior: EmpresTI na Vercel conectado ao Supabase, com `main` remota no merge c5669eb. A prática está na branch local pratica/sdd-subagentes. Consulte docs/publicacao.md para a publicação anterior.
2. Enunciado: pratica-sdd-subagentes.html. A estudante aprovou as specs 002 e 003, cinco empréstimos, 14 dias úteis em São Paulo e TI-0004/TI-0007/TI-0010 em manutenção.
3. Verificador nativo e gate: e61c776 e 291efd7. Prova 9de0065 reprovou CA-04. Reversão e7e0af6 corrigiu a falha. 9b417df incorporou os dois commits ao histórico sem alterar a árvore.
4. Skill imagens-equipamentos: fc08575. Vínculos de descoberta locais no repo e na pasta de trabalho. Simulação produziu 12 WebP de 800 × 600, repetiu sem mudar hashes e rejeitou conteúdo duplicado.
5. Specs e planos aprovados em 714840a. Dados iniciais e integração local de foto em db7aeef. Regra de empréstimo em a2f1c63. A migration 0003 foi aplicada somente no Postgres local da porta 5433.
6. Checks da revisão a2f1c63: estrutura, lint com aviso antigo, tipos, 21 Vitest, build, 12 Playwright e git diff --check passaram.
7. Pixabay substituiu Pexels no commit adf6b6f. O passo 2 preparou os 12 WebP de 800 × 600 e conferiu IDs, créditos e hashes. A responsável aprovou a prancha em 05/11/2026, e a aprovação consta no manifesto local.
8. O SQL de carga e a consulta de conferência estão em .equipamentos-fotos. A responsável humana executa a migration, publica o lote, confirma a conta do professor e aplica a carga conforme docs/specs/002-dados-iniciais/operacao.md. O próximo passo é o push deliberado de pratica/sdd-subagentes com [migrate-db].
9. ENTREGA.md registra o estado local. Completar as evidências de produção, repetir os pareceres na revisão exata e criar a tag entrega-pratica após os dois vereditos PRONTA. Consulte docs/specs/002-dados-iniciais e docs/specs/003-solicitar-emprestimo.
10. Fase 1: gate exige duas specs, oito checks e linhas de testes identificados. Teste descartável e Playwright com URL fictícia passaram. API GitHub confirmou que main está desprotegida por limitação de plano no repositório privado. Operacao.md registra a conferência manual dos checks no PR e a promoção humana da candidata.
