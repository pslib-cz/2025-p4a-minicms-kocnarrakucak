"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaArrowRight, FaTrash } from "react-icons/fa";

type PromptOwnerActionsProps = {
  promptId: string;
};

export function PromptOwnerActions({ promptId }: PromptOwnerActionsProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Delete this prompt? This cannot be undone.")) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/prompts/${promptId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        alert(payload?.error || "Failed to delete prompt.");
        return;
      }

      router.push("/dashboard/prompts");
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Failed to delete prompt.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Link
        href={`/dashboard/prompts/${promptId}/edit`}
        className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-strong px-4 py-2 text-[13px] text-foreground shadow-[0_18px_35px_rgba(0,0,0,0.16)] transition hover:bg-panel"
      >
        <span>Edit prompt</span>
        <FaArrowRight size={11} />
      </Link>

      <button
        type="button"
        onClick={handleDelete}
        disabled={isDeleting}
        className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-[13px] text-foreground transition hover:bg-surface-strong disabled:cursor-not-allowed disabled:opacity-60"
      >
        <FaTrash size={11} />
        <span>{isDeleting ? "Deleting..." : "Delete prompt"}</span>
      </button>
    </div>
  );
}
