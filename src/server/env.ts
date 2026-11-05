import { z } from "zod";

const schema = z.object({
  DATABASE_URL: z.url(),
  SUPABASE_URL: z.url(),
  SUPABASE_ANON_KEY: z.string().min(1),
});
export function authEnvironment() {
  const parsed = schema.safeParse({
    ...process.env,
    SUPABASE_URL:
      process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_ANON_KEY:
      process.env.SUPABASE_ANON_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });
  if (!parsed.success)
    throw new Error(
      "Configuração de servidor incompleta. Confira .env.example sem expor credenciais.",
    );
  return parsed.data;
}
