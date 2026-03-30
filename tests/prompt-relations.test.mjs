import test from "node:test";
import assert from "node:assert/strict";
import {
  resolvePromptTypeSelection,
  validatePromptRelationSelection,
} from "../src/lib/prompt-relations.ts";

test("resolvePromptTypeSelection keeps a valid selected prompt type", () => {
  assert.equal(
    resolvePromptTypeSelection("type-2", [{ id: "type-1" }, { id: "type-2" }]),
    "type-2"
  );
});

test("resolvePromptTypeSelection falls back to the first available type or empty string", () => {
  assert.equal(resolvePromptTypeSelection("missing", [{ id: "type-1" }, { id: "type-2" }]), "type-1");
  assert.equal(resolvePromptTypeSelection("missing", []), "");
});

test("validatePromptRelationSelection rejects missing prompt types and stale tags", () => {
  assert.deepEqual(
    validatePromptRelationSelection({
      promptTypeId: "",
      availablePromptTypeIds: [],
      tagIds: [],
      availableTagIds: [],
    }),
    {
      valid: false,
      error: "Prompt type is required before saving a prompt.",
    }
  );

  assert.deepEqual(
    validatePromptRelationSelection({
      promptTypeId: "type-1",
      availablePromptTypeIds: ["type-1"],
      tagIds: ["tag-1", "tag-2"],
      availableTagIds: ["tag-1"],
    }),
    {
      valid: false,
      error:
        "One or more selected tags no longer exist. Refresh the page and review your tag selection.",
      missingTagIds: ["tag-2"],
    }
  );

  assert.deepEqual(
    validatePromptRelationSelection({
      promptTypeId: "type-1",
      availablePromptTypeIds: ["type-1"],
      tagIds: ["tag-1"],
      availableTagIds: ["tag-1"],
    }),
    { valid: true }
  );
});
