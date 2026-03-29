import test from "node:test";
import assert from "node:assert/strict";
import { resolveSiteUrl, toAbsoluteUrl } from "../src/lib/site.ts";

test("resolveSiteUrl keeps a valid absolute URL and trims trailing slash", () => {
  assert.equal(resolveSiteUrl("https://promptvault.example.com/"), "https://promptvault.example.com");
});

test("resolveSiteUrl prefixes bare hosts with https", () => {
  assert.equal(resolveSiteUrl("promptvault.vercel.app"), "https://promptvault.vercel.app");
});

test("resolveSiteUrl falls back to localhost for invalid values", () => {
  assert.equal(resolveSiteUrl(":// totally invalid"), "http://localhost:3000");
});

test("toAbsoluteUrl builds an absolute URL from a path", () => {
  process.env.NEXT_PUBLIC_APP_URL = "https://promptvault.example.com";
  assert.equal(
    toAbsoluteUrl("/dashboard/prompts"),
    "https://promptvault.example.com/dashboard/prompts"
  );
});
