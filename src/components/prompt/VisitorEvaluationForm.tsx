"use client";

import { useState } from "react";
import { FaStar } from "react-icons/fa";

type AiModel = {
  id: string;
  name: string;
  provider: string;
};

type ExistingEvaluation = {
  aiModelId: string;
};

type Props = {
  promptId: string;
  models: AiModel[];
  existingEvaluations: ExistingEvaluation[];
};

export function VisitorEvaluationForm({ promptId, models, existingEvaluations }: Props) {
  const [submittedModelIds, setSubmittedModelIds] = useState<string[]>(
    existingEvaluations.map((e) => e.aiModelId)
  );
  const [selectedModelId, setSelectedModelId] = useState("");
  const [hoveredStar, setHoveredStar] = useState(0);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const availableModels = models.filter((m) => !submittedModelIds.includes(m.id));

  const handleSubmit = async () => {
    if (!selectedModelId || rating === 0) return;
    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch(`/api/prompts/${promptId}/evaluations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aiModelId: selectedModelId, rating, comment }),
      });

      if (res.ok) {
        setSubmittedModelIds((prev) => [...prev, selectedModelId]);
        setSelectedModelId("");
        setRating(0);
        setHoveredStar(0);
        setComment("");
      } else {
        const data = await res.json();
        setError(data.error || "Failed to submit rating.");
      }
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (availableModels.length === 0) {
    return (
      <p className="text-[13px] italic text-muted">
        You&apos;ve already rated this prompt with all available AI models.
      </p>
    );
  }

  const displayRating = hoveredStar || rating;

  return (
    <div className="space-y-5">
      <div>
        <label className="mb-3 block text-[14px] text-foreground">
          Which AI Model did you use?
        </label>
        <div className="flex flex-wrap gap-2">
          {availableModels.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setSelectedModelId(m.id)}
              className={`rounded-full border px-4 py-2 text-[13px] transition ${
                selectedModelId === m.id
                  ? "border-border bg-surface-strong text-foreground shadow-[0_18px_35px_rgba(0,0,0,0.16)]"
                  : "border-border bg-surface text-muted hover:text-foreground"
              }`}
            >
              {m.name}
              <span className="ml-1.5 text-xs opacity-70">{m.provider}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-3 block text-[14px] text-foreground">
          Your rating
        </label>
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5].map((val) => (
            <button
              key={val}
              type="button"
              onMouseEnter={() => setHoveredStar(val)}
              onMouseLeave={() => setHoveredStar(0)}
              onClick={() => setRating(val)}
              className={`flex size-11 items-center justify-center rounded-full border text-xl transition ${
                val <= displayRating
                  ? "border-yellow-500/40 bg-yellow-500/10 text-yellow-400"
                  : "border-border text-muted hover:text-yellow-300"
              }`}
            >
              <FaStar />
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-3 block text-[14px] text-foreground">
          Comment <span className="font-normal text-muted">(optional)</span>
        </label>
        <textarea
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="How well did this model handle the prompt?"
          className="w-full rounded-[20px] border border-border bg-[rgba(255,255,255,0.03)] px-4 py-3 text-[14px] text-foreground placeholder:text-muted focus:border-foreground/30 focus:outline-none resize-none transition"
        />
      </div>

      {error && (
        <p className="rounded-[18px] border border-red-500/30 bg-red-500/10 px-4 py-3 text-[13px] text-red-300">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!selectedModelId || rating === 0 || isSubmitting}
        className="rounded-full border border-border bg-surface-strong px-6 py-3 text-[13px] text-foreground shadow-[0_18px_35px_rgba(0,0,0,0.16)] transition hover:bg-panel disabled:cursor-not-allowed disabled:opacity-40"
      >
        {isSubmitting ? "Submitting…" : "Submit Rating"}
      </button>
    </div>
  );
}
