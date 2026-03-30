type PromptTypeOption = {
  id: string;
};

type PromptRelationValidationInput = {
  promptTypeId: string;
  availablePromptTypeIds: string[];
  tagIds: string[];
  availableTagIds: string[];
};

type PromptRelationValidationResult =
  | {
      valid: true;
    }
  | {
      valid: false;
      error: string;
      missingTagIds?: string[];
    };

export function resolvePromptTypeSelection(
  currentPromptTypeId: string,
  promptTypes: PromptTypeOption[]
) {
  if (promptTypes.length === 0) {
    return "";
  }

  if (currentPromptTypeId && promptTypes.some((promptType) => promptType.id === currentPromptTypeId)) {
    return currentPromptTypeId;
  }

  return promptTypes[0].id;
}

export function validatePromptRelationSelection({
  promptTypeId,
  availablePromptTypeIds,
  tagIds,
  availableTagIds,
}: PromptRelationValidationInput): PromptRelationValidationResult {
  if (!promptTypeId) {
    return {
      valid: false,
      error: "Prompt type is required before saving a prompt.",
    };
  }

  if (!availablePromptTypeIds.includes(promptTypeId)) {
    return {
      valid: false,
      error: "The selected prompt type no longer exists. Choose another prompt type and try again.",
    };
  }

  const missingTagIds = tagIds.filter((tagId) => !availableTagIds.includes(tagId));
  if (missingTagIds.length > 0) {
    return {
      valid: false,
      error: "One or more selected tags no longer exist. Refresh the page and review your tag selection.",
      missingTagIds,
    };
  }

  return { valid: true };
}
