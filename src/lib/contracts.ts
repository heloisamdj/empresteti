import { z } from "zod";

export const categories = [
  "NOTEBOOK",
  "MONITOR",
  "CAMERA",
  "ACCESSORY",
  "CABLE",
  "PROJECTOR",
] as const;
export const categoryLabels: Record<(typeof categories)[number], string> = {
  NOTEBOOK: "Notebook",
  MONITOR: "Monitor",
  CAMERA: "Câmera",
  ACCESSORY: "Acessório",
  CABLE: "Cabo",
  PROJECTOR: "Projetor",
};
export const loginInput = z
  .object({
    email: z.email("Informe um e-mail válido."),
    password: z.string().min(1, "Informe a senha.").max(200),
  })
  .strict();
export const equipmentInput = z
  .object({
    name: z.string().trim().min(2, "Informe o nome.").max(120),
    category: z.enum(categories),
    patrimony: z
      .string()
      .trim()
      .regex(/^PAT-\d{4,}$/, "Use PAT-0000."),
    serialNumber: z.string().trim().max(120).optional(),
    location: z.string().trim().max(160).optional(),
    notes: z.string().trim().max(1000).optional(),
    status: z.enum(["AVAILABLE", "MAINTENANCE", "OUT_OF_SERVICE"]),
  })
  .strict();
export const listInput = z
  .object({
    direction: z.enum(["forward", "backward"]).optional(),
    order: z.enum(["catalog", "recent"]).default("catalog"),
    search: z.string().trim().max(120).default(""),
    category: z.enum(categories).optional(),
    availableOnly: z.boolean().default(false),
    cursor: z.string().uuid().optional(),
    limit: z.number().int().min(1).max(30).default(7),
  })
  .strict();
export const operationsInput = z
  .object({
    direction: z.enum(["forward", "backward"]).optional(),
    search: z.string().trim().max(120).default(""),
    filter: z.enum(["all", "late", "week", "pending"]).default("all"),
    category: z.enum(categories).optional(),
    cursor: z.string().uuid().optional(),
    limit: z.number().int().min(1).max(30).default(7),
  })
  .strict();
export const idInput = z.object({ id: z.uuid() }).strict();
export const patrimonyInput = z
  .object({
    patrimony: z.string().min(1).max(80),
    cursor: z.uuid().optional(),
    direction: z.enum(["forward", "backward"]).optional(),
    limit: z.number().int().min(1).max(30).default(20),
  })
  .strict();
export const paginationInput = z
  .object({
    cursor: z.uuid().optional(),
    direction: z.enum(["forward", "backward"]).optional(),
    limit: z.number().int().min(1).max(30).default(20),
  })
  .strict()
  .default({ limit: 20 });
export const MAX_ITEMS = 5;
export const LOAN_DAYS = 14;
export function formatDate(value: Date | string) {
  const parts = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    timeZone: "America/Sao_Paulo",
  }).formatToParts(new Date(value));
  return `${parts.find((part) => part.type === "day")?.value}/${parts.find((part) => part.type === "month")?.value.replace(/\./g, "")}`;
}
