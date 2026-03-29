"use client";

import { useEffect, useState } from "react";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Button, Input, Spinner, Tooltip, Textarea } from "@nextui-org/react";
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
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Models</h1>
          <p className="text-zinc-500 mt-1">Manage global AI Models used for evaluating Prompts.</p>
        </div>
        {!isAdding && (
          <Button color="primary" onPress={() => setIsAdding(true)} startContent={<FaPlus />}>
            Add Model
          </Button>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-blue-200 dark:border-blue-900/30 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold">New AI Model</h3>
            <Button size="sm" variant="light" onPress={() => setIsAdding(false)}>
              Cancel
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input isRequired label="Model Name" placeholder="e.g. GPT-4o" value={formData.name} onValueChange={(v) => setFormData({...formData, name: v})} />
            <Input isRequired label="Provider" placeholder="e.g. OpenAI" value={formData.provider} onValueChange={(v) => setFormData({...formData, provider: v})} />
            <Textarea className="md:col-span-2" label="Description" placeholder="Model specifics or details..." value={formData.description} onValueChange={(v) => setFormData({...formData, description: v})} />
            <Input className="md:col-span-2" label="Website URL" placeholder="https://..." value={formData.websiteUrl} onValueChange={(v) => setFormData({...formData, websiteUrl: v})} />
          </div>
          <div className="flex justify-end">
            <Button color="primary" type="submit" isLoading={isSubmitting} startContent={<FaSave />}>Save Model</Button>
          </div>
        </form>
      )}

      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden p-2">
        <Table aria-label="AI Models table" shadow="none" classNames={{ wrapper: "bg-transparent shadow-none" }}>
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
                  <div className="flex flex-col">
                    <span className="font-semibold">{item.name}</span>
                    <span className="text-xs text-zinc-500">{item.description}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {item.websiteUrl ? (
                    <a href={item.websiteUrl} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">{item.provider}</a>
                  ) : (
                    item.provider
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex justify-end pr-2">
                    <Tooltip color="danger" content="Delete model">
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
