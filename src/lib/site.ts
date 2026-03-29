const DEFAULT_SITE_URL = "http://localhost:3000";

function normalizeUrl(value: string) {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

export function resolveSiteUrl(
  value = process.env.NEXT_PUBLIC_APP_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.VERCEL_URL ||
    DEFAULT_SITE_URL
) {
  const candidate = value?.trim();

  if (!candidate) {
    return DEFAULT_SITE_URL;
  }

  const withProtocol =
    candidate.startsWith("http://") || candidate.startsWith("https://")
      ? candidate
      : `https://${candidate}`;

  try {
    return normalizeUrl(new URL(withProtocol).toString());
  } catch {
    return DEFAULT_SITE_URL;
  }
}

export function getSiteUrl() {
  return resolveSiteUrl();
}

export function getSiteUrlObject() {
  return new URL(getSiteUrl());
}

export function toAbsoluteUrl(pathname = "/") {
  return new URL(pathname, getSiteUrl()).toString();
}
