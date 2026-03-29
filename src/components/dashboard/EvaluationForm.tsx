"use client";

import { useState } from "react";
import { Button, Select, SelectItem, Textarea } from "@nextui-org/react";
import { FormField } from "@/components/FormField";
import { DashboardPanel } from "@/components/dashboard/DashboardPanel";
import { FaStar, FaTrash } from "react-icons/fa";

type AiModel = {
  id: string;
  name: string;
  provider: string;
};

type ExistingEvaluation = {
  id: string;
  aiModelId: string;
  rating: number;
  comment: string | null;
  aiModel: AiModel;
};

type EvaluationFormProps = {
  promptId: string;
  models: AiModel[];
  existingEvaluations: ExistingEvaluation[];
};

export function EvaluationForm({ promptId, models, existingEvaluations }: EvaluationFormProps) {
  const [evaluations, setEvaluations] = useState(existingEvaluations);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    aiModelId: "",
    rating: 3,
    comment: "",
  });

  const availableModels = models.filter((m) => !evaluations.some((e) => e.aiModelId === m.id));

  const selectClassNames = {
    label: "text-muted",
    value: "text-foreground",
    trigger:
      "min-h-12 rounded-[18px] border border-border bg-[rgba(255,255,255,0.03)] shadow-none data-[focus=true]:border-foreground/30",
    popoverContent: "border border-border bg-surface text-foreground",
  } as const;

  const textAreaClassNames = {
    label: "text-muted",
    inputWrapper:
      "rounded-[18px] border border-border bg-[rgba(255,255,255,0.03)] shadow-none group-data-[focus=true]:border-foreground/30",
    input: "text-foreground",
  } as const;

  const handleAdd = async () => {
    try {
      const res = await fetch(`/api/prompts/${promptId}/evaluations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const newEval: ExistingEvaluation = await res.json();
        setEvaluations([...evaluations, newEval]);
        setIsAdding(false);
        setFormData({ aiModelId: "", rating: 3, comment: "" });
      } else {
        const err = await res.json();
        alert(err.error || "Failed to add evaluation");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (evalId: string) => {
    if (!confirm("Delete this evaluation?")) return;
    try {
      const res = await fetch(`/api/prompts/${promptId}/evaluations/${evalId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setEvaluations(evaluations.filter((e) => e.id !== evalId));
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {evaluations.map((ev) => (
          <DashboardPanel key={ev.id} className="relative space-y-4 overflow-visible">
            <Button
              isIconOnly
              variant="flat"
              size="sm"
              className="absolute -right-3 -top-3 z-10 rounded-full border border-border bg-surface-strong text-danger"
              onPress={() => handleDelete(ev.id)}
            >
              <FaTrash size={12} />
            </Button>

            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <h3 className="text-[18px] font-medium text-foreground">{ev.aiModel.name}</h3>
                <p className="text-[12px] uppercase tracking-[0.16em] text-muted">{ev.aiModel.provider}</p>
              </div>
              <div className="flex text-yellow-500">
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} className={i < ev.rating ? "" : "text-zinc-300 dark:text-zinc-700"} />
                ))}
              </div>
            </div>

            {ev.comment && (
              <div className="rounded-[20px] border border-border/80 bg-[rgba(255,255,255,0.02)] px-4 py-4">
                <p className="text-[13px] leading-[1.7] text-muted">{ev.comment}</p>
              </div>
            )}
          </DashboardPanel>
        ))}
      </div>

      {!isAdding && availableModels.length > 0 && (
        <Button
          variant="flat"
          onPress={() => setIsAdding(true)}
          className="h-11 rounded-full border border-border bg-surface-strong px-5 text-[13px] text-foreground transition hover:bg-panel"
        >
          Add Model Evaluation
        </Button>
      )}

      {isAdding && (
        <DashboardPanel className="space-y-5">
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-1">
              <h3 className="text-[20px] font-medium text-foreground">New evaluation</h3>
              <p className="text-[13px] text-muted">Record how this prompt performs on one model.</p>
            </div>
            <Button size="sm" variant="light" onPress={() => setIsAdding(false)}>
              Cancel
            </Button>
          </div>

          <FormField label="Select AI model">
            <Select
              aria-label="Select AI model"
              placeholder="Choose AI model"
              selectedKeys={formData.aiModelId ? [formData.aiModelId] : []}
              onChange={(e) => setFormData({ ...formData, aiModelId: e.target.value })}
              classNames={selectClassNames}
            >
              {availableModels.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.name}
                </SelectItem>
              ))}
            </Select>
          </FormField>

          <div className="space-y-3">
              <p className="text-[14px] text-foreground">Rating</p>
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setFormData({ ...formData, rating: val })}
                    className={`flex size-10 items-center justify-center rounded-full border transition ${
                      val <= formData.rating
                        ? "border-yellow-500/40 bg-yellow-500/10 text-yellow-500"
                        : "border-border text-muted hover:text-yellow-300"
                    }`}
                  >
                    <FaStar />
                  </button>
                ))}
              </div>
            </div>

            <FormField label="Comment / thoughts">
              <Textarea
                aria-label="Comment / thoughts"
                placeholder="How well did this model handle the prompt?"
                value={formData.comment}
                onValueChange={(val) => setFormData({ ...formData, comment: val })}
                minRows={4}
                classNames={textAreaClassNames}
              />
            </FormField>

            <div className="flex justify-end pt-2">
              <Button
                onPress={handleAdd}
                isDisabled={!formData.aiModelId}
                className="h-11 rounded-full border border-border bg-surface-strong px-5 text-[13px] text-foreground transition hover:bg-panel"
              >
                Save Evaluation
              </Button>
            </div>
        </DashboardPanel>
      )}
    </div>
  );
}
