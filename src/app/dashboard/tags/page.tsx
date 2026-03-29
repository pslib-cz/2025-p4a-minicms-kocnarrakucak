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
import { FaTrash, FaPlus } from "react-icons/fa";

type Tag = {
  id: string;
  name: string;
};

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newTag, setNewTag] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchTags = async () => {
    try {
      const res = await fetch("/api/tags");
      const data = await res.json();
      setTags(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTag.trim()) return;
    
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newTag.trim() }),
      });
      if (res.ok) {
        const added = await res.json();
        setTags((prev) => [...prev, added].sort((a, b) => a.name.localeCompare(b.name)));
        setNewTag("");
      } else {
        const err = await res.json();
        alert(err.error || "Failed to add tag");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure? This tag will be removed from all prompts.")) return;
    try {
      const res = await fetch(`/api/tags/${id}`, { method: "DELETE" });
      if (res.ok) {
        setTags((prev) => prev.filter(t => t.id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-8">
      <DashboardPageHeader
        eyebrow="Taxonomy"
        title="Tags"
        description="Manage the shared tag layer used by public filtering, prompt organization and editorial consistency."
      />

      <DashboardPanel className="space-y-5">
        <div className="flex flex-wrap items-center gap-3 text-[13px] text-muted">
          <span className="rounded-full border border-border bg-surface-strong px-4 py-2 text-foreground">
            Total tags: {tags.length}
          </span>
          <span className="rounded-full border border-border px-4 py-2">
            Shared across all prompts
          </span>
        </div>

        <form onSubmit={handleAdd} className="grid gap-3 md:grid-cols-[minmax(0,20rem)_auto] md:items-end">
          <FormField label="New tag name">
            <Input
              aria-label="New tag name"
              placeholder="e.g. SEO"
              value={newTag}
              onValueChange={setNewTag}
              isRequired
              classNames={{
                label: "text-muted",
                inputWrapper:
                  "min-h-12 rounded-[18px] border border-border bg-[rgba(255,255,255,0.03)] shadow-none",
                input: "text-foreground",
              }}
            />
          </FormField>
          <Button
            type="submit"
            isLoading={isSubmitting}
            startContent={<FaPlus />}
            className="h-12 rounded-full border border-border bg-surface-strong px-5 text-[13px] text-foreground shadow-[0_18px_35px_rgba(0,0,0,0.16)] transition hover:bg-panel"
          >
            Add tag
          </Button>
        </form>
      </DashboardPanel>

      <DashboardPanel>
        <div className="overflow-hidden rounded-[24px] border border-border/80 bg-[rgba(255,255,255,0.02)] p-2">
          <Table
            aria-label="Tags table"
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
              <TableColumn align="end">ACTIONS</TableColumn>
            </TableHeader>
            <TableBody
              items={tags}
              isLoading={isLoading}
              loadingContent={<Spinner label="Loading..." />}
              emptyContent={isLoading ? " " : "No tags found."}
            >
              {(item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <span className="text-[14px] text-foreground">{item.name}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end pr-2">
                      <Tooltip color="danger" content="Delete tag">
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
