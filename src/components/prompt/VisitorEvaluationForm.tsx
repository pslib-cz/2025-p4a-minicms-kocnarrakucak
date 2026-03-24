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
      <p className="text-sm text-zinc-500 dark:text-zinc-400 italic">
        You&apos;ve already rated this prompt with all available AI models.
      </p>
    );
  }

  const displayRating = hoveredStar || rating;

  return (
    <div className="space-y-5">
      {/* Model Select */}
      <div>
        <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
          Which AI Model did you use?
        </label>
        <div className="flex flex-wrap gap-2">
          {availableModels.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setSelectedModelId(m.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                selectedModelId === m.id
                  ? "bg-blue-600 text-white border-blue-600 shadow-md"
                  : "bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:border-blue-400"
              }`}
            >
              {m.name}
              <span className="ml-1.5 text-xs opacity-70">{m.provider}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Stars */}
      <div>
        <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
          Your rating
        </label>
        <div className="flex space-x-1">
          {[1, 2, 3, 4, 5].map((val) => (
            <button
              key={val}
              type="button"
              onMouseEnter={() => setHoveredStar(val)}
              onMouseLeave={() => setHoveredStar(0)}
              onClick={() => setRating(val)}
              className={`text-3xl transition-all duration-100 ${
                val <= displayRating
                  ? "text-yellow-400 scale-110"
                  : "text-zinc-300 dark:text-zinc-600 hover:text-yellow-300"
              }`}
            >
              <FaStar />
            </button>
          ))}
        </div>
      </div>

      {/* Comment */}
      <div>
        <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
          Comment <span className="font-normal text-zinc-400">(optional)</span>
        </label>
        <textarea
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="How well did this model handle the prompt?"
          className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition"
        />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!selectedModelId || rating === 0 || isSubmitting}
        className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-md"
      >
        {isSubmitting ? "Submitting…" : "Submit Rating"}
      </button>
    </div>
  );
}
