# Plano 003 — Solicitar empréstimo

Reutilize Router → Service → Prisma e o contexto de tenant do ADR-001. A transação e os bloqueios existentes por vínculo e equipamento permanecem a base da concorrência. Preserve o índice único de empréstimo aberto por equipamento. Centralize o limite e o cálculo do prazo. Use o mesmo cálculo para a previsão exibida e para a data gravada.

Ajuste avisos, mensagens de erro, diálogo de confirmação e contagens que hoje indicam o limite e prazo antigos. Preserve a data gravada de empréstimos anteriores. Cubra a passagem de fim de semana, o limite sob concorrência e a recusa por atraso usando o Postgres descartável. Use o fluxo publicado com a conta de teste após a publicação da spec 002 pelo responsável.
