export const pixabayLicense = "https://pixabay.com/service/license-summary/";

export function pixabayPhotoPage(value, id) {
  if (typeof value !== "string" || !URL.canParse(value)) return null;
  const url = new URL(value);
  const slug = url.pathname.split("/").filter(Boolean).at(-1);
  if (
    url.origin !== "https://pixabay.com" ||
    url.username ||
    url.password ||
    url.search ||
    url.hash ||
    !(slug === String(id) || slug?.endsWith(`-${id}`))
  )
    return null;
  return url;
}

export function pixabayImageUrl(value) {
  const url = new URL(value);
  const permitted =
    (url.origin === "https://pixabay.com" &&
      url.pathname.startsWith("/get/")) ||
    (url.origin === "https://cdn.pixabay.com" &&
      url.pathname.startsWith("/photo/"));
  if (!permitted || url.username || url.password)
    throw new Error("URL de imagem fora do Pixabay.");
  return url;
}
