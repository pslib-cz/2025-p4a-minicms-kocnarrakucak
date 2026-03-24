"use client";

import { useEffect, useState } from "react";
import {
  Table, TableHeader, TableColumn, TableBody, TableRow, TableCell,
  Button, Input, Spinner, Tooltip,
} from "@nextui-org/react";
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
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Prompt Types</h1>
          <p className="text-zinc-500 mt-1">Manage global Prompt Types used to categorize Prompts.</p>
        </div>
        {!isAdding && (
          <Button color="primary" onClick={() => setIsAdding(true)} startContent={<FaPlus />}>
            Add Type
          </Button>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-blue-200 dark:border-blue-900/30 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold">New Prompt Type</h3>
            <Button size="sm" variant="light" onClick={() => { setIsAdding(false); setSlugManuallyEdited(false); setFormData({ name: "", slug: "" }); }}>
              Cancel
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              isRequired
              label="Name"
              placeholder='e.g. "Text to image"'
              value={formData.name}
              onValueChange={handleNameChange}
            />
            <Input
              isRequired
              label="Slug"
              placeholder='e.g. "text-to-image"'
              description="Used in URLs. Auto-generated from name."
              value={formData.slug}
              onValueChange={handleSlugChange}
            />
          </div>
          <div className="flex justify-end">
            <Button color="primary" type="submit" isLoading={isSubmitting} startContent={<FaSave />}>
              Save Type
            </Button>
          </div>
        </form>
      )}

      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden p-2">
        <Table aria-label="Prompt Types table" shadow="none" classNames={{ wrapper: "bg-transparent shadow-none" }}>
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
                  <span className="font-semibold">{item.name}</span>
                </TableCell>
                <TableCell>
                  <code className="text-xs text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded">{item.slug}</code>
                </TableCell>
                <TableCell>
                  <div className="flex justify-end pr-2">
                    <Tooltip color="danger" content="Delete type">
                      <span onClick={() => handleDelete(item.id)} className="text-lg text-danger cursor-pointer active:opacity-50">
                        <FaTrash />
                      </span>
                    </Tooltip>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
