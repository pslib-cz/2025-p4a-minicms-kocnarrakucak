"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FaStar, FaTrash } from "react-icons/fa";
import { canManageEvaluation } from "@/lib/evaluation-permissions";

type PromptEvaluation = {
  id: string;
  rating: number;
  comment: string | null;
  userId: string;
  user: {
    id: string;
    name: string | null;
    username: string;
  };
  aiModel: {
    name: string;
    provider: string;
  };
};

type PromptEvaluationsProps = {
  promptId: string;
  promptOwnerId: string;
  currentUserId?: string;
  currentUserRole?: "USER" | "ADMIN";
  evaluations: PromptEvaluation[];
  panelClassName: string;
};

export function PromptEvaluations({
  promptId,
  promptOwnerId,
  currentUserId,
  currentUserRole,
  evaluations,
  panelClassName,
}: PromptEvaluationsProps) {
  const router = useRouter();
  const [items, setItems] = useState(evaluations);

  useEffect(() => {
    setItems(evaluations);
  }, [evaluations]);

  const handleDelete = async (evaluationId: string) => {
    if (!confirm("Delete this review?")) {
      return;
    }

    try {
      const response = await fetch(`/api/prompts/${promptId}/evaluations/${evaluationId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        return;
      }

      setItems((current) => current.filter((item) => item.id !== evaluationId));
      router.refresh();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {items.map((evaluation) => {
        const authorLabel = evaluation.user.name || evaluation.user.username;
        const canDelete = canManageEvaluation({
          currentUserId,
          currentUserRole,
          evaluationUserId: evaluation.userId,
          promptOwnerId,
        });

        return (
          <article key={evaluation.id} className={`${panelClassName} relative`}>
            {canDelete && (
              <button
                type="button"
                onClick={() => handleDelete(evaluation.id)}
                className="absolute right-5 top-5 flex size-9 items-center justify-center rounded-full border border-border bg-surface-strong text-danger transition hover:opacity-80"
                aria-label="Delete review"
              >
                <FaTrash size={12} />
              </button>
            )}

            <div className="flex items-start justify-between gap-4 pr-12">
              <div className="space-y-1">
                <h3 className="text-[20px] font-medium text-foreground">{evaluation.aiModel.name}</h3>
                <p className="text-[12px] uppercase tracking-[0.16em] text-muted">
                  {evaluation.aiModel.provider}
                </p>
              </div>
              <div className="flex text-sm text-yellow-400">
                {[...Array(5)].map((_, index) => (
                  <FaStar
                    key={index}
                    className={index < evaluation.rating ? "" : "text-muted-soft"}
                  />
                ))}
              </div>
            </div>

            <p className="mt-4 text-[12px] uppercase tracking-[0.16em] text-muted">
              Reviewed by {authorLabel}
            </p>

            {evaluation.comment && (
              <div className="mt-5 rounded-[22px] border border-border/80 bg-[rgba(255,255,255,0.02)] px-5 py-4">
                <p className="text-[14px] leading-[1.8] text-muted">{evaluation.comment}</p>
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}
