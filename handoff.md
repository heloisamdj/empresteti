# Handoff — 04/11/2026

1. Tarefa ativa: usuário autorizou publicar na Vercel, integrar Supabase e ativar skills. Local funciona; publicação ainda depende da configuração remota. Detalhes em docs/publicacao.md.
2. Git: fix/prisma-build enviada ao GitHub; base f66add3/1a31b67 rebased sobre origin/main, seguida das correções finais de catálogo e registros. Noreply da conta heloisamdj resolveu bloqueio de autoria na Vercel; nenhuma alteração enviada à main.
3. Banco local: migrations 0001/0002 e seed suporte_ti aplicados em empresti-helo-dev, Postgres16 localhost:5433; MLOps5432 preservado. Nenhuma migration remota aplicada.
4. Checks após correções: estrutura, lint (um aviso antigo), tipos,19Vitest,build,10Playwright passaram. E2E usa contexto de identidade simulado; não comprova login real.
5. Vercel: projeto empresteti-hzyj (prj_zaWeyVUhtZaqE4GH8SOfl6N4AsWm), equipe helo-98ee. CLI autorizado. Prévias --prod --skip-domain falharam no preflight; domínio principal continua antigo.
6. Causa confirmada: Vercel usa Auth fobuhqvjheblmwbiwera e DATABASE_URL/DIRECT_URL localhost. Variáveis sensitive não podem ser recuperadas por API; não tentar contornar. Uso normal pelo job mantém valores na plataforma, sem exportação.
7. Supabase: navegador integrado funcionou; usuário logou como heloisamdj. Só consta projeto pkncugbogwvxyulbngjr, originalmente pausado e ligado ao repo antigo emprestimoTI. Usuário AUTORIZOU usar e reativar esse projeto; reativação solicitada, estado Coming up. Isso substitui a orientação anterior de não trocar fobuh.
8. Próximo: obter/configurar conexões e URL/chave pública DO PROJETO pkn... sem divulgar valores, conferir banco existente e provisionamento da conta real, resolver job de migration conforme ADR001 §9 antes de executar e só promover após sucesso.
9. Job scripts/deploy-database.mjs é explícito, não boot; guarda ID Vercel, referências/schema/banco idênticos, checksums e ausência de reset. Modo migrate ainda NÃO executado. ADR prevê GitHubActions; exceção Vercel ainda não resolvida.
10. Skills: frontend-design enabledtrue no scanner nativo; Junctions .agents/skills apontam à fonte única skills/. Provas independentes positiva e negativa concluídas; template não ativado. Ver docs/auditoria-skills-mcp.md.
11. NÃO mudar senha do banco, sobrescrever schema existente, reutilizar chaves fobuh no pkn, imprimir segredos ou confundir prévia com publicação concluída. No Windows, encerrar testes antes de regenerar Prisma.
