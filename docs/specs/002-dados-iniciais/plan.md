# Plano 002 — Dados iniciais

O ADR-001 define Prisma Migrate, Supabase Auth e tenant por sessão. A atualização adiciona um caminho de foto opcional ao equipamento e reaproveita o catálogo do ADR-002. O caminho aponta para um objeto versionado por hash no bucket público. Os créditos individuais ficam no manifesto da skill. A interface exibe o crédito com link e aceita registros históricos sem foto.

Prepare uma carga transacional e verificável no banco local. A carga valida patrimônio e conjunto de fotos antes da primeira escrita e usa a restrição de unicidade existente. O provisionamento de Auth é separado do vínculo de negócio. O responsável executa a migration pelo procedimento do ADR e publica os objetos, o inventário e o vínculo. O agente prepara os comandos revisáveis e a verificação de leitura.

Teste a repetição e colisões em Postgres descartável. Com chave autorizada, prepare e revise as fotos. O responsável verifica os arquivos publicados e o acesso ao site, mantendo a conta do professor livre de empréstimos. Submeta a revisão exata ao verificador.
