import { expect, it } from "vitest";
import { loanDeadline } from "../../src/server/services/loan-deadline";
import { saoPauloHolidays } from "../../src/server/services/sao-paulo-holidays";

it("spec 004 test_ca_01 calendário coincide com os feriados oficiais da capital em 2026", () => {
  const calendar = [...saoPauloHolidays(2026)]
    .sort((a, b) => a - b)
    .map((date) => new Date(date).toISOString().slice(0, 10));
  expect(calendar).toEqual([
    "2026-01-01",
    "2026-01-25",
    "2026-04-03",
    "2026-04-21",
    "2026-05-01",
    "2026-06-04",
    "2026-07-09",
    "2026-09-07",
    "2026-10-12",
    "2026-11-02",
    "2026-11-15",
    "2026-11-20",
    "2026-12-25",
  ]);
});

it("spec 004 test_ca_01 pula feriados regionais e móveis sem transferir feriados ou excluir pontos facultativos", () => {
  const cases = [
    ["2026-01-22", "2026-02-12"], // Aniversário da capital no domingo
    ["2026-02-12", "2026-03-05"], // Carnaval como ponto facultativo
    ["2026-03-26", "2026-04-17"], // Sexta-feira da Paixão
    ["2026-05-28", "2026-06-19"], // Corpus Christi
    ["2026-07-01", "2026-07-23"], // Data Magna do Estado
    ["2026-12-31", "2027-01-22"], // Ano-Novo
    ["2027-01-21", "2027-02-12"], // Aniversário da capital na segunda
    ["2027-03-19", "2027-04-10"], // Sexta-feira da Paixão em outra data
  ];
  for (const [start, end] of cases) {
    expect(loanDeadline(new Date(`${start}T12:00:00Z`)).toISOString()).toBe(
      `${end}T02:59:59.999Z`,
    );
  }
});

it("spec 004 test_ca_02 exclui a Consciência Negra e usa a data local do pedido", () => {
  expect(loanDeadline(new Date("2026-11-05T12:00:00Z")).toISOString()).toBe(
    "2026-11-27T02:59:59.999Z",
  );
  // 01:30 UTC de sábado ainda é sexta-feira em São Paulo.
  expect(loanDeadline(new Date("2026-11-07T01:30:00Z")).toISOString()).toBe(
    "2026-11-28T02:59:59.999Z",
  );
  expect(loanDeadline(new Date("2026-11-08T12:00:00Z")).toISOString()).toBe(
    "2026-11-28T02:59:59.999Z",
  );
});
