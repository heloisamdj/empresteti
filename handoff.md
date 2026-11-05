# Handoff — prática SDD

1. Base de produção anterior: EmpresTI na Vercel conectado ao Supabase, com `main` remota no merge c5669eb. A prática está na branch local pratica/sdd-subagentes. Consulte docs/publicacao.md para a publicação anterior.
2. Enunciado: pratica-sdd-subagentes.html. A estudante aprovou as specs 002 e 003, cinco empréstimos, 14 dias úteis em São Paulo e TI-0004/TI-0007/TI-0010 em manutenção.
3. Verificador nativo e gate: e61c776 e 291efd7. Prova 9de0065 reprovou CA-04. Reversão e7e0af6 corrigiu a falha. 9b417df incorporou os dois commits ao histórico sem alterar a árvore.
4. Skill imagens-equipamentos: fc08575. Vínculos de descoberta locais no repo e na pasta de trabalho. Simulação produziu 12 WebP de 800 × 600, repetiu sem mudar hashes e rejeitou conteúdo duplicado.
5. Specs e planos aprovados em 714840a. Dados iniciais e integração local de foto em db7aeef. Regra de empréstimo em a2f1c63. A migration 0003 foi aplicada somente no Postgres local da porta 5433.
6. Checks da revisão a2f1c63: estrutura, lint com aviso antigo, tipos, 21 Vitest, build, 12 Playwright e git diff --check passaram.
7. Pixabay substituiu Pexels no commit adf6b6f. A chave está no arquivo local ignorado. A triagem separou 9 arquivos, com TI-0007, TI-0011 e TI-0012 pendentes. Veja docs/specs/002-dados-iniciais/revisao-fotos.md e .equipamentos-fotos/lote-revisado. O manifesto parcial bloqueia a carga.
8. O responsável humano executa migration, cadastro Auth do professor, upload e carga em produção. Use docs/specs/002-dados-iniciais/operacao.md. Teste empréstimos com conta separada.
9. ENTREGA.md registra o estado local. Completar as evidências de produção, repetir os pareceres na revisão exata e criar a tag entrega-pratica após os dois vereditos PRONTA. Consulte docs/specs/002-dados-iniciais e docs/specs/003-solicitar-emprestimo.
