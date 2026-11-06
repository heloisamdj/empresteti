# Plano 004 — Calendário de devolução

O ADR-001 mantém a regra de negócio no serviço e restringe novas dependências. Amplie o cálculo compartilhado de vencimento no servidor. Represente os feriados fixos pela data civil e derive Sexta-feira da Paixão e Corpus Christi da Páscoa gregoriana. A regra pode ser testada com datas conhecidas e funciona na virada de ano sem API externa. Uma tabela anual manual exigiria atualização até para feriados recorrentes, enquanto consultar uma API durante o pedido acrescentaria uma dependência e uma causa de falha.

Reutilize a previsão do serviço e o vencimento persistido. A correção da barra segue o Nocturne do ADR-002 e usa o intervalo gravado, inclusive em empréstimos históricos. Faça testes de calendário, integração do pedido e navegador. A regra entra em vigor para novos pedidos, sem migration ou atualização de dados.
