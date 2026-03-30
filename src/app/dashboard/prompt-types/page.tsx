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
  Tooltip,
} from "@nextui-org/react";
import { FormField } from "@/components/FormField";
import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";
import { DashboardPanel } from "@/components/dashboard/DashboardPanel";
import { FaTrash, FaPlus, FaSave } from "react-icons/fa";

type PromptType = {
  id: string;
  name: string;
  slug: string;
};

export default function PromptTypesPage() {
  const [types, setTypes] = useState<PromptType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: "", slug: "" });
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  useEffect(() => {
    fetch("/api/prompt-types")
      .then((r) => r.json())
      .then(setTypes)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const toSlug = (str: string) =>
    str.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  const handleNameChange = (v: string) => {
    setFormData((prev) => ({
      name: v,
      slug: slugManuallyEdited ? prev.slug : toSlug(v),
    }));
  };

  const handleSlugChange = (v: string) => {
    setSlugManuallyEdited(true);
    setFormData((prev) => ({ ...prev, slug: v }));
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/prompt-types", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        const added = await res.json();
        setTypes((prev) => [...prev, added].sort((a, b) => a.name.localeCompare(b.name)));
        setFormData({ name: "", slug: "" });
        setSlugManuallyEdited(false);
        setIsAdding(false);
      } else {
        const err = await res.json();
        alert(err.error || "Failed to add prompt type");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this type? Prompts using it cannot be deleted.")) return;
    try {
      const res = await fetch(`/api/prompt-types/${id}`, { method: "DELETE" });
      if (res.ok) {
        setTypes((prev) => prev.filter((t) => t.id !== id));
      } else {
        const err = await res.json();
        alert(err.error || "Failed to delete prompt type");
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-8">
      <DashboardPageHeader
        eyebrow="Structure"
        title="Prompt Types"
        description="Control the route-level content types used by the public library and prompt detail URLs."
        action={
          !isAdding ? (
            <Button
              onPress={() => setIsAdding(true)}
              startContent={<FaPlus />}
              className="h-12 rounded-full border border-border bg-surface-strong px-5 text-[13px] text-foreground shadow-[0_18px_35px_rgba(0,0,0,0.16)] transition hover:bg-panel"
            >
              Add type
            </Button>
          ) : undefined
        }
      />

      <DashboardPanel className="space-y-5">
        <div className="flex flex-wrap items-center gap-3 text-[13px] text-muted">
          <span className="rounded-full border border-border bg-surface-strong px-4 py-2 text-foreground">
            Total types: {types.length}
          </span>
          <span className="rounded-full border border-border px-4 py-2">
            Used in public routes
          </span>
        </div>

        {isAdding && (
          <form onSubmit={handleAdd} className="space-y-4 rounded-[24px] border border-border/80 bg-[rgba(255,255,255,0.02)] p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-[20px] font-medium text-foreground">New prompt type</h2>
                <p className="mt-1 text-[13px] text-muted">Define a reusable route group like text-to-text or code-generation.</p>
              </div>
              <Button
                size="sm"
                variant="light"
                onPress={() => {
                  setIsAdding(false);
                  setSlugManuallyEdited(false);
                  setFormData({ name: "", slug: "" });
                }}
              >
                Cancel
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField label="Name">
                <Input
                  isRequired
                  aria-label="Name"
                  placeholder='e.g. "Summarization"'
                  value={formData.name}
                  onValueChange={handleNameChange}
                  classNames={{
                    label: "text-muted",
                    inputWrapper:
                      "min-h-12 rounded-[18px] border border-border bg-[rgba(255,255,255,0.03)] shadow-none",
                  }}
                />
              </FormField>
              <FormField label="Slug" hint="Used in URLs. Auto-generated from name.">
                <Input
                  isRequired
                  aria-label="Slug"
                  placeholder='e.g. "summarization"'
                  value={formData.slug}
                  onValueChange={handleSlugChange}
                  classNames={{
                    label: "text-muted",
                    description: "text-muted-soft",
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
                Save type
              </Button>
            </div>
          </form>
        )}
      </DashboardPanel>

      <DashboardPanel>
        <div className="overflow-hidden rounded-[24px] border border-border/80 bg-[rgba(255,255,255,0.02)] p-2">
          <Table
            aria-label="Prompt Types table"
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
              <TableColumn>SLUG</TableColumn>
              <TableColumn align="end">ACTIONS</TableColumn>
            </TableHeader>
            <TableBody
              items={types}
              isLoading={isLoading}
              loadingContent={<Spinner label="Loading..." />}
              emptyContent={isLoading ? " " : "No Prompt Types found."}
            >
              {(item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <span className="text-[14px] text-foreground">{item.name}</span>
                  </TableCell>
                  <TableCell>
                    <code className="rounded-full border border-border px-3 py-1 text-[12px] text-muted">
                      {item.slug}
                    </code>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end pr-2">
                      <Tooltip color="danger" content="Delete type">
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
