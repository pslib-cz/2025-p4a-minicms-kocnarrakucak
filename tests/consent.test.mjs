import test from "node:test";
import assert from "node:assert/strict";
import {
  COOKIE_CONSENT_KEY,
  buildConsentCookie,
  parseConsentStatus,
  readConsentFromCookieString,
} from "../src/lib/consent.ts";

test("parseConsentStatus returns accepted or rejected for valid values", () => {
  assert.equal(parseConsentStatus("accepted"), "accepted");
  assert.equal(parseConsentStatus("rejected"), "rejected");
});

test("parseConsentStatus falls back to pending for unexpected values", () => {
  assert.equal(parseConsentStatus("maybe"), "pending");
  assert.equal(parseConsentStatus(null), "pending");
});

test("readConsentFromCookieString extracts consent state from cookie header", () => {
  const cookieString = `theme=dark; ${COOKIE_CONSENT_KEY}=accepted; session=abc`;
  assert.equal(readConsentFromCookieString(cookieString), "accepted");
});

test("buildConsentCookie creates a long-lived site-wide cookie", () => {
  const cookie = buildConsentCookie("accepted");
  assert.match(cookie, new RegExp(`^${COOKIE_CONSENT_KEY}=accepted`));
  assert.match(cookie, /Path=\//);
  assert.match(cookie, /Max-Age=31536000/);
});
