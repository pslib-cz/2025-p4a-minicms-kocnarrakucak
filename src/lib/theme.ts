export const THEME_STORAGE_KEY = "theme";

export type Theme = "light" | "dark";

export function parseTheme(value?: string | null): Theme {
  return value === "light" ? "light" : "dark";
}

export function buildThemeCookie(theme: Theme) {
  return `${THEME_STORAGE_KEY}=${theme}; Path=/; Max-Age=31536000; SameSite=Lax`;
}
