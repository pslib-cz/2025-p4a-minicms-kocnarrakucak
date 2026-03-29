export const COOKIE_CONSENT_KEY = "promptvault_cookie_consent";

export type ConsentStatus = "pending" | "accepted" | "rejected";

export function parseConsentStatus(value?: string | null): ConsentStatus {
  if (value === "accepted" || value === "rejected") {
    return value;
  }

  return "pending";
}

export function readConsentFromCookieString(cookieString: string) {
  const cookies = cookieString.split(";").map((part) => part.trim());
  const match = cookies.find((cookie) => cookie.startsWith(`${COOKIE_CONSENT_KEY}=`));

  if (!match) {
    return "pending";
  }

  return parseConsentStatus(match.split("=")[1]);
}

export function buildConsentCookie(status: Exclude<ConsentStatus, "pending">) {
  return `${COOKIE_CONSENT_KEY}=${status}; Path=/; Max-Age=31536000; SameSite=Lax`;
}
