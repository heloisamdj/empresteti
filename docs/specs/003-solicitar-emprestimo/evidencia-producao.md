# Validação do empréstimo em produção

Em 05/11/2026, o domínio público servia a implantação
`dpl_ACVkuZAwg78M4gDueceHpSJ47quY`, do commit `d4e95c5`.
[Implantação na Vercel](https://vercel.com/helo-98ee/empresteti-hzyj/ACVkuZAwg78M4gDueceHpSJ47quY)

- A responsável confirmou fotos visíveis no catálogo da candidata. Após a
  promoção, a consulta em leitura ao Supabase confirmou 12 equipamentos
  com fotos e TI-0004, TI-0007 e TI-0010 em manutenção.
- Em uma captura da conta de teste, Meus empréstimos exibiu TI-0006,
  retirado em 05/nov, com devolução em 25/nov e situação No prazo.
  A responsável confirmou que o equipamento saiu do filtro de disponíveis.
- A responsável relatou a mensagem do sexto pedido: “Limite de 5 itens
  atingido. Devolva um item antes de solicitar outro.” A consulta ao banco
  confirmou cinco empréstimos abertos, sem um sexto registro. Os itens eram
  TI-0006, TI-0001, TI-0011, TI-0008 e TI-0012, todos com retirada em
  05/11/2026 e prazo de 25/11/2026 no fuso de São Paulo.
- A página Meus empréstimos respondeu HTTP 200. A consulta tRPC
  `loans.mine` sem sessão retornou HTTP 401 com `UNAUTHORIZED`.
- Após a demonstração, a consulta de leitura confirmou um vínculo
  `MEMBER` e zero empréstimos na conta do professor. A demonstração
  usou a conta da estudante.

Os bloqueios por atraso e manutenção, a concorrência e o isolamento entre
usuários e tenants também estão cobertos pelos testes locais da spec. A
captura de tela serviu para conferência do prazo, e os dados pessoais da
conta de teste ficaram fora deste registro.
