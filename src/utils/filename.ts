import sanitize from "sanitize-filename";

export const slugifyFilenamePart = (
  value: string | null | undefined,
  fallback = "unknown"
) => {
  const normalized = (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  const slug = normalized
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");

  return sanitize(slug || fallback);
};
