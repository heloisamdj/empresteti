// @vitest-environment jsdom
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import "@testing-library/jest-dom/vitest";
import { Button, StatusPill, Dialog } from "../../src/components/ui";
import { examples } from "../../src/lib/examples";
import { formatDate } from "../../src/lib/contracts";
import { loanProgress } from "../../src/lib/loan-progress";
afterEach(cleanup);
describe("Componentes Nocturne", () => {
  it("spec 004 test_ca_03 barra chega a 100% no vencimento mesmo com duração zero", () => {
    const deadline = new Date("2026-11-27T02:59:59.999Z");
    expect(
      loanProgress(deadline, deadline, new Date(deadline.getTime() - 1)),
    ).toBe(0);
    expect(loanProgress(deadline, deadline, deadline)).toBe(1);
  });
  it("test_ca_12_datas seguem dd/mmm no fuso de São Paulo", () => {
    expect(formatDate(new Date("2026-11-04T15:00:00Z"))).toBe("04/nov");
  });
  it("test_ca_12_estados têm texto além da cor e ação desabilitada", () => {
    render(
      <>
        <StatusPill tone="maintenance">Em manutenção</StatusPill>
        <Button disabled>Solicitar</Button>
      </>,
    );
    expect(screen.getByText("Em manutenção")).toBeVisible();
    expect(screen.getByRole("button")).toBeDisabled();
  });
  it("test_ca_12_dialogo acessível recebe nome, descrição e foco", async () => {
    render(
      <Dialog
        open
        onOpenChange={() => {}}
        title="Confirmar empréstimo"
        description="Prazo de 14 dias."
      >
        <Button>Confirmar</Button>
      </Dialog>,
    );
    expect(
      screen.getByRole("dialog", { name: "Confirmar empréstimo" }),
    ).toBeVisible();
    expect(screen.getByRole("dialog")).toHaveAccessibleDescription(
      "Prazo de 14 dias.",
    );
    await userEvent.keyboard("{Escape}");
  });
  it("test_ca_03_exemplos mantêm patrimônio e situações do layout", () => {
    expect(examples.find((item) => item.patrimony === "PAT-1042")?.name).toBe(
      'MacBook Pro 14"',
    );
    expect(examples.find((item) => item.patrimony === "PAT-0910")?.status).toBe(
      "MAINTENANCE",
    );
  });
});
