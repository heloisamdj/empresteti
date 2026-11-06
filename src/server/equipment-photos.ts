export function equipmentPhotoBase() {
  const configured =
    process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!configured || !URL.canParse(configured)) return null;
  const url = new URL(configured);
  if (
    url.protocol !== "https:" ||
    !/^[a-z0-9]+\.supabase\.co$/.test(url.hostname)
  )
    return null;
  return new URL("/storage/v1/object/public/equipamentos/", url.origin).href;
}

export function equipmentPhotoUrl(photoPath: string | null) {
  if (!photoPath || !/^TI-\d{4}\/[a-f0-9]{64}\.webp$/.test(photoPath))
    return null;
  const base = equipmentPhotoBase();
  return base ? new URL(photoPath, base).href : null;
}
