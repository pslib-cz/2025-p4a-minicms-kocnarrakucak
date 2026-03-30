export type EvaluationPermissionInput = {
  currentUserId?: string | null;
  currentUserRole?: "USER" | "ADMIN" | null;
  evaluationUserId: string;
  promptOwnerId: string;
};

export function canManageEvaluation({
  currentUserId,
  currentUserRole,
  evaluationUserId,
  promptOwnerId,
}: EvaluationPermissionInput) {
  if (!currentUserId) {
    return false;
  }

  return (
    currentUserRole === "ADMIN" ||
    currentUserId === evaluationUserId ||
    currentUserId === promptOwnerId
  );
}
