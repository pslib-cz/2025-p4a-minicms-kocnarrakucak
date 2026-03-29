"use client";

import { useEffect, useState } from "react";
import {
  Button,
  Input,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Textarea,
  Tooltip,
} from "@nextui-org/react";
import { FormField } from "@/components/FormField";
import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";
import { DashboardPanel } from "@/components/dashboard/DashboardPanel";
import { FaTrash, FaPlus, FaSave } from "react-icons/fa";

type AiModel = {
  id: string;
  name: string;
  provider: string;
  description: string | null;
  websiteUrl: string | null;
};

export default function AiModelsPage() {
  const [models, setModels] = useState<AiModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: "", provider: "", description: "", websiteUrl: "" });

  const fetchModels = async () => {
    try {
      const res = await fetch("/api/ai-models");
      const data = await res.json();
      setModels(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchModels();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/ai-models", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        const added = await res.json();
        setModels((prev) => [...prev, added].sort((a, b) => a.name.localeCompare(b.name)));
        setFormData({ name: "", provider: "", description: "", websiteUrl: "" });
        setIsAdding(false);
      } else {
        const err = await res.json();
        alert(err.error || "Failed to add model");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure? This will delete all evaluations for this model as well.")) return;
    try {
      const res = await fetch(`/api/ai-models/${id}`, { method: "DELETE" });
      if (res.ok) {
        setModels((prev) => prev.filter(m => m.id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-8">
      <DashboardPageHeader
        eyebrow="Evaluation"
        title="AI Models"
        description="Maintain the list of evaluation targets used to compare prompt performance across providers."
        action={
          !isAdding ? (
            <Button
              onPress={() => setIsAdding(true)}
              startContent={<FaPlus />}
              className="h-12 rounded-full border border-border bg-surface-strong px-5 text-[13px] text-foreground shadow-[0_18px_35px_rgba(0,0,0,0.16)] transition hover:bg-panel"
            >
              Add model
            </Button>
          ) : undefined
        }
      />

      <DashboardPanel className="space-y-5">
        <div className="flex flex-wrap items-center gap-3 text-[13px] text-muted">
          <span className="rounded-full border border-border bg-surface-strong px-4 py-2 text-foreground">
            Total models: {models.length}
          </span>
          <span className="rounded-full border border-border px-4 py-2">
            Shared across all evaluations
          </span>
        </div>

        {isAdding && (
          <form onSubmit={handleAdd} className="space-y-4 rounded-[24px] border border-border/80 bg-[rgba(255,255,255,0.02)] p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-[20px] font-medium text-foreground">New AI model</h2>
                <p className="mt-1 text-[13px] text-muted">Add a provider target for prompt review and comparison.</p>
              </div>
              <Button size="sm" variant="light" onPress={() => setIsAdding(false)}>
                Cancel
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField label="Model name">
                <Input
                  isRequired
                  aria-label="Model name"
                  placeholder="e.g. GPT-4o"
                  value={formData.name}
                  onValueChange={(value) => setFormData({ ...formData, name: value })}
                  classNames={{
                    label: "text-muted",
                    inputWrapper:
                      "min-h-12 rounded-[18px] border border-border bg-[rgba(255,255,255,0.03)] shadow-none",
                  }}
                />
              </FormField>
              <FormField label="Provider">
                <Input
                  isRequired
                  aria-label="Provider"
                  placeholder="e.g. OpenAI"
                  value={formData.provider}
                  onValueChange={(value) => setFormData({ ...formData, provider: value })}
                  classNames={{
                    label: "text-muted",
                    inputWrapper:
                      "min-h-12 rounded-[18px] border border-border bg-[rgba(255,255,255,0.03)] shadow-none",
                  }}
                />
              </FormField>
              <FormField className="md:col-span-2" label="Description">
                <Textarea
                  aria-label="Description"
                  placeholder="Model specifics or evaluation notes..."
                  value={formData.description}
                  onValueChange={(value) => setFormData({ ...formData, description: value })}
                  classNames={{
                    label: "text-muted",
                    inputWrapper:
                      "rounded-[18px] border border-border bg-[rgba(255,255,255,0.03)] shadow-none",
                  }}
                />
              </FormField>
              <FormField className="md:col-span-2" label="Website URL">
                <Input
                  aria-label="Website URL"
                  placeholder="https://..."
                  value={formData.websiteUrl}
                  onValueChange={(value) => setFormData({ ...formData, websiteUrl: value })}
                  classNames={{
                    label: "text-muted",
                    inputWrapper:
                      "min-h-12 rounded-[18px] border border-border bg-[rgba(255,255,255,0.03)] shadow-none",
                  }}
                />
              </FormField>
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                isLoading={isSubmitting}
                startContent={<FaSave />}
                className="h-11 rounded-full border border-border bg-surface-strong px-5 text-[13px] text-foreground transition hover:bg-panel"
              >
                Save model
              </Button>
            </div>
          </form>
        )}
      </DashboardPanel>

      <DashboardPanel>
        <div className="overflow-hidden rounded-[24px] border border-border/80 bg-[rgba(255,255,255,0.02)] p-2">
          <Table
            aria-label="AI Models table"
            shadow="none"
            classNames={{
              base: "bg-transparent",
              wrapper: "bg-transparent p-0 shadow-none",
              th: "border-b border-border/80 bg-transparent text-[11px] uppercase tracking-[0.18em] text-muted",
              td: "border-b border-border/70 py-4",
              tr: "data-[hover=true]:bg-white/0",
            }}
          >
            <TableHeader>
              <TableColumn>NAME</TableColumn>
              <TableColumn>PROVIDER</TableColumn>
              <TableColumn align="end">ACTIONS</TableColumn>
            </TableHeader>
            <TableBody
              items={models}
              isLoading={isLoading}
              loadingContent={<Spinner label="Loading..." />}
              emptyContent={isLoading ? " " : "No AI Models found."}
            >
              {(item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span className="text-[14px] text-foreground">{item.name}</span>
                      {item.description && (
                        <span className="text-[12px] leading-[1.6] text-muted">{item.description}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-[13px] text-muted">
                    {item.websiteUrl ? (
                      <a href={item.websiteUrl} target="_blank" rel="noreferrer" className="text-foreground underline underline-offset-4">
                        {item.provider}
                      </a>
                    ) : (
                      item.provider
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end pr-2">
                      <Tooltip color="danger" content="Delete model">
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          className="flex size-9 items-center justify-center rounded-full border border-border text-danger transition active:opacity-50"
                        >
                          <FaTrash />
                        </button>
                      </Tooltip>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </DashboardPanel>
    </div>
  );
}
