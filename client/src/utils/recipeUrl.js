export function buildFallbackSearchTerm(url) {
  try {
    const parsedUrl = new URL(url);
    const slug = parsedUrl.pathname
      .split("/")
      .filter(Boolean)
      .pop();

    if (!slug) {
      return "";
    }

    return slug
      .replace(/\.[a-z0-9]+$/i, "")
      .replace(/[-_]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  } catch {
    return "";
  }
}
