# Spec 004 — Calendário de devolução

Status: spec e plano aprovados pela estudante para a revisão pós-entrega.

## Regra de negócio

- Um dia útil é um dia em que o balcão de Operações recebe devoluções. Cobrar um dia em que o balcão está fechado reduziria o prazo efetivo do colaborador.
- A referência da unidade atual é São Paulo capital, onde funciona o Ensino Médio Técnico da Germinare. O prazo conta de segunda a sexta no fuso `America/Sao_Paulo`, excluindo os feriados nacionais, estaduais de São Paulo e municipais da capital.
- Feriados que caem no fim de semana não descontam um segundo dia. Pontos facultativos, emendas e recessos só alteram a contagem quando Operações informa e publica o fechamento no calendário da unidade. A primeira versão usa os feriados oficiais como padrão. A agenda de fechamentos excepcionais fica para uma mudança com dados confirmados.
- Conte a partir do dia seguinte ao pedido. O vencimento continua no fim do 14º dia útil local. A previsão e a data gravada usam a mesma regra.
- Prazos já gravados são preservados. A barra em Meus empréstimos representa a fração do intervalo entre retirada e vencimento de cada empréstimo, incluindo os registros anteriores.

## Critérios de aceite

- CA-01: a contagem pula fins de semana e os feriados fixos e móveis aplicáveis em São Paulo capital, sem transferir automaticamente feriados de fim de semana nem incluir pontos facultativos. O cálculo funciona na virada do ano.
- CA-02: um pedido de 05/11/2026 vence no fim de 26/11/2026 em São Paulo porque o feriado nacional de 20/11 fica fora da contagem. A regra de fuso vale também para um pedido feito após a meia-noite UTC enquanto ainda é o dia anterior em São Paulo.
- CA-03: previsão, confirmação e estado de atraso usam o vencimento correspondente ao empréstimo. Um empréstimo já gravado conserva sua data, e a barra só atinge 100% ao alcançar esse vencimento.

## Referências

- [Regimento da Germinare, art. 1º](https://institutojef.org.br/wp-content/uploads/2024/05/Escola-Germinare-Regimento-Escolar-2024-com-Aprovacao.pdf).
- [Calendário de 2026 da Prefeitura de São Paulo](https://www2.prefeitura.sp.gov.br/web/gestao/w/calendario_2026).
- [Calendário federal de 2026](https://legis.sigepe.gov.br/sigepe-bgp-ws-legis/legis-service/download/?id=0026440285-ALPDF%2F2025).
- [Lei municipal nº 14.485, arts. 9º e 10](https://legislacao.prefeitura.sp.gov.br/lei-20000-de-19-de-julho-de-2007/consolidado).
- [Lei paulista nº 9.497 sobre 9 de julho](https://www.al.sp.gov.br/repositorio/legislacao/lei/1997/compilacao-lei-9497-05.03.1997.html).
- [Lei federal nº 14.759 sobre 20 de novembro](https://www2.camara.leg.br/legin/fed/lei/2023/lei-14759-21-dezembro-2023-795091-publicacaooriginal-170522-pl.html).
