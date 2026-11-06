import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import {
  pixabayLicense,
  pixabayPhotoPage,
} from "../skills/imagens-equipamentos/scripts/pixabay.mjs";

const inventory = JSON.parse(
  readFileSync(
    new URL(
      "../skills/imagens-equipamentos/assets/equipamentos.json",
      import.meta.url,
    ),
    "utf8",
  ),
);
const category = {
  notebook: "NOTEBOOK",
  monitor: "MONITOR",
  cabo: "CABLE",
  camera: "CAMERA",
};
const literal = (value) => "'" + value.replaceAll("'", "''") + "'";

export function inventorySql(
  manifest,
  { includeTeacher = false, supabaseEditor = false } = {},
) {
  const images = manifest.images ?? [];
  if (
    manifest.provider !== "pixabay" ||
    manifest.status !== "aprovado" ||
    !manifest.reviewedBy?.trim() ||
    images.length !== inventory.length ||
    new Set(images.map((image) => image.pixabayId)).size !== inventory.length ||
    new Set(images.map((image) => image.sha256)).size !== inventory.length
  )
    throw new Error(
      "O manifesto precisa de aprovação visual e 12 fotos distintas.",
    );

  const values = inventory.map((item) => {
    const image = images.find((entry) => entry.patrimonio === item.patrimonio);
    if (
      !image ||
      !Number.isSafeInteger(image.pixabayId) ||
      image.pixabayId < 1 ||
      !image.author?.trim() ||
      image.license !== pixabayLicense ||
      !pixabayPhotoPage(image.source, image.pixabayId) ||
      !/^[a-f0-9]{64}$/.test(image.sha256) ||
      image.width !== 800 ||
      image.height !== 600 ||
      image.storagePath !== `${item.patrimonio}/${image.sha256}.webp`
    )
      throw new Error(`Manifesto inválido para ${item.patrimonio}.`);
    const status = item.situacao === "manutencao" ? "MAINTENANCE" : "AVAILABLE";
    return `(${[item.patrimonio, item.nome, category[item.categoria], status, image.storagePath].map(literal).join(", ")})`;
  });

  return `DO $pratica$
DECLARE
  tenant uuid;
  item record;
  existing public.equipments%ROWTYPE;
  teacher_id uuid;
  teacher_auth_id uuid;${supabaseEditor ? editorDeclarations : ""}
BEGIN
  ${includeTeacher ? teacherLookup : ""}${supabaseEditor ? editorSetup : ""}
  SELECT id INTO STRICT tenant FROM public.tenants WHERE slug = 'suporte_ti';
  FOR item IN SELECT * FROM (VALUES
    ${values.join(",\n    ")}
  ) AS input(patrimony, name, category, status, photo_path)
  LOOP
    INSERT INTO public.equipments
      (id, tenant_id, patrimony, name, category, status, photo_path, updated_at)
    VALUES (gen_random_uuid(), tenant, item.patrimony, item.name,
      item.category::public.equipment_category, item.status::public.equipment_status,
      item.photo_path, CURRENT_TIMESTAMP)
    ON CONFLICT (tenant_id, patrimony) DO NOTHING;

    SELECT * INTO STRICT existing FROM public.equipments
      WHERE tenant_id = tenant AND patrimony = item.patrimony FOR UPDATE;
    IF existing.name <> item.name OR existing.category::text <> item.category OR
       (existing.photo_path IS NOT NULL AND existing.photo_path <> item.photo_path) THEN
      RAISE EXCEPTION 'Conflito no patrimônio %', item.patrimony;
    END IF;
    IF existing.photo_path IS NULL THEN
      UPDATE public.equipments SET photo_path = item.photo_path, updated_at = CURRENT_TIMESTAMP
        WHERE id = existing.id;
    END IF;
  END LOOP;
  ${includeTeacher ? teacherSql : ""}${supabaseEditor ? editorRestore : ""}
END
$pratica$;`;
}

const teacherLookup = `
  BEGIN
    SELECT id INTO STRICT teacher_auth_id FROM auth.users
      WHERE email = 'marcelo.grilo@institutojef.org.br' AND email_confirmed_at IS NOT NULL;
  EXCEPTION WHEN NO_DATA_FOUND THEN
    RAISE EXCEPTION 'Confirme a conta do professor no Supabase Auth antes da carga.';
  END;`;

const teacherSql = `
  INSERT INTO public.users (id, auth_user_id, name, email, updated_at)
    VALUES (gen_random_uuid(), teacher_auth_id::text, 'Marcelo Grilo',
      'marcelo.grilo@institutojef.org.br', CURRENT_TIMESTAMP)
    ON CONFLICT (email) DO NOTHING;
  SELECT id INTO STRICT teacher_id FROM public.users
    WHERE email = 'marcelo.grilo@institutojef.org.br' AND auth_user_id = teacher_auth_id::text FOR UPDATE;
  IF EXISTS (SELECT 1 FROM public.loans WHERE user_id = teacher_id) THEN
    RAISE EXCEPTION 'A conta do professor já tem histórico de empréstimos';
  END IF;
  INSERT INTO public.memberships (id, user_id, tenant_id, role)
    VALUES (gen_random_uuid(), teacher_id, tenant, 'MEMBER')
    ON CONFLICT (user_id, tenant_id) DO NOTHING;
  IF NOT EXISTS (SELECT 1 FROM public.memberships
    WHERE user_id = teacher_id AND tenant_id = tenant AND role = 'MEMBER') THEN
    RAISE EXCEPTION 'Vínculo do professor tem um perfil diferente do esperado';
  END IF;`;

const editorDeclarations = `
  previous_inherit boolean;
  restore_membership boolean := false;`;

// O SQL Editor precisa ler auth.users como postgres e gravar nas tabelas
// do aplicativo. A associação é restaurada no mesmo bloco da carga.
const editorSetup = `
  IF current_user <> 'postgres' THEN
    RAISE EXCEPTION 'Execute a carga no SQL Editor com o papel postgres.';
  END IF;
  IF (
    SELECT count(*) FROM pg_class
    WHERE relnamespace = 'public'::regnamespace
      AND relname IN ('equipments', 'tenants', 'users', 'memberships', 'loans')
      AND relowner = 'empresti_v1'::regrole
  ) <> 5 THEN
    RAISE EXCEPTION 'As tabelas da carga não pertencem ao papel empresti_v1.';
  END IF;
  IF NOT pg_has_role(current_user, 'empresti_v1', 'USAGE') THEN
    SELECT inherit_option INTO previous_inherit
    FROM pg_auth_members
    WHERE roleid = 'empresti_v1'::regrole
      AND member = 'postgres'::regrole
      AND grantor = 'postgres'::regrole;

    IF previous_inherit IS NULL THEN
      GRANT empresti_v1 TO postgres WITH INHERIT TRUE, SET FALSE GRANTED BY postgres;
    ELSE
      GRANT empresti_v1 TO postgres WITH INHERIT TRUE GRANTED BY postgres;
    END IF;
    restore_membership := true;
  END IF;`;

const editorRestore = `
  IF restore_membership THEN
    IF previous_inherit IS NULL THEN
      REVOKE empresti_v1 FROM postgres GRANTED BY postgres;
    ELSE
      GRANT empresti_v1 TO postgres WITH INHERIT FALSE GRANTED BY postgres;
    END IF;
  END IF;`;

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  const file = process.argv[2];
  if (!file) throw new Error("Informe o caminho do manifesto aprovado.");
  console.log(
    inventorySql(JSON.parse(readFileSync(file, "utf8")), {
      includeTeacher: true,
      supabaseEditor: true,
    }),
  );
}
