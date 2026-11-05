# Spec 003 — Solicitar empréstimo

Status: aprovada pela estudante para implementação local.

## Decisões da prática

- O pedido de item disponível cria o empréstimo imediatamente. O catálogo passa a exibi-lo como emprestado. Aprovação, fila e reserva ficam fora do fluxo.
- A estudante escolheu o briefing novo para limite e prazo. A prática substitui, neste fluxo, o limite histórico de três por cinco e o prazo histórico de 14 dias corridos por 14 dias úteis.
- A contagem usa segunda a sexta no fuso `America/Sao_Paulo`, a partir do dia seguinte ao pedido, com vencimento no fim do décimo quarto dia útil. A estudante aprovou essa convenção na ausência de calendário de feriados na atividade. Pedidos existentes conservam o prazo já gravado.
- A conta do professor é reservada para correção. A demonstração usa a conta da estudante ou outra conta de teste.
- Devolução, Operações, notificações, reservas e renovação ficam fora das mudanças desta spec.

## Critérios de aceite

- CA-01: colaborador autenticado vê os 12 equipamentos da spec 002 com foto, nome, categoria e situação.
- CA-02: item disponível solicitado gera um empréstimo imediatamente, some do filtro de disponíveis e aparece em Meus empréstimos com a data prevista em 14 dias úteis.
- CA-03: o quinto empréstimo aberto é permitido e o sexto é recusado com mensagem visível. Um empréstimo vencido bloqueia novos pedidos mesmo abaixo do limite.
- CA-04: manutenção e empréstimo aberto bloqueiam pedidos no servidor e na interface. Inclui TI-0004, TI-0007 e TI-0010 em manutenção no inventário inicial.
- CA-05: pedidos concorrentes para o mesmo equipamento criam só um empréstimo, inclusive entre usuários diferentes. Pedidos concorrentes do mesmo usuário não ultrapassam cinco.
- CA-06: Meus empréstimos mostra os empréstimos próprios em aberto e suas datas, com isolamento entre usuários e tenants.
