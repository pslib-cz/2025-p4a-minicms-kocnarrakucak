import test from "node:test";
import assert from "node:assert/strict";
import { canManageEvaluation } from "../src/lib/evaluation-permissions.ts";

test("evaluation author can manage their own evaluation", () => {
  assert.equal(
    canManageEvaluation({
      currentUserId: "user-1",
      currentUserRole: "USER",
      evaluationUserId: "user-1",
      promptOwnerId: "owner-1",
    }),
    true
  );
});

test("prompt owner and admin can manage evaluations they do not own", () => {
  assert.equal(
    canManageEvaluation({
      currentUserId: "owner-1",
      currentUserRole: "USER",
      evaluationUserId: "user-2",
      promptOwnerId: "owner-1",
    }),
    true
  );

  assert.equal(
    canManageEvaluation({
      currentUserId: "admin-1",
      currentUserRole: "ADMIN",
      evaluationUserId: "user-2",
      promptOwnerId: "owner-1",
    }),
    true
  );
});

test("unrelated visitors cannot manage evaluations", () => {
  assert.equal(
    canManageEvaluation({
      currentUserId: "user-3",
      currentUserRole: "USER",
      evaluationUserId: "user-2",
      promptOwnerId: "owner-1",
    }),
    false
  );

  assert.equal(
    canManageEvaluation({
      currentUserId: null,
      currentUserRole: null,
      evaluationUserId: "user-2",
      promptOwnerId: "owner-1",
    }),
    false
  );
});
