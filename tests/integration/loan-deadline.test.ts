import { expect, it } from "vitest";
import { loanDeadline } from "../../src/server/services/loan-deadline";

it("spec 003 test_ca_02 prazo de 14 dias úteis cruza fins de semana e usa o dia de São Paulo", () => {
  // 01:30 UTC de sábado ainda é sexta-feira em São Paulo.
  expect(loanDeadline(new Date("2026-11-07T01:30:00Z")).toISOString()).toBe(
    "2026-11-27T02:59:59.999Z",
  );
  expect(loanDeadline(new Date("2026-11-08T12:00:00Z")).toISOString()).toBe(
    "2026-11-27T02:59:59.999Z",
  );
  expect(loanDeadline(new Date("2026-12-31T12:00:00Z")).toISOString()).toBe(
    "2027-01-21T02:59:59.999Z",
  );
});
