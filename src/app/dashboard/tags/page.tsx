"use client";

import { useEffect, useState } from "react";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Button, Input, Spinner, Tooltip } from "@nextui-org/react";
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
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tags</h1>
          <p className="text-zinc-500 mt-1">Manage global tags for categorizing your prompts.</p>
        </div>
      </div>

      <form onSubmit={handleAdd} className="flex gap-3 items-end bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
        <Input 
          className="max-w-xs" 
          label="New Tag Name" 
          placeholder="e.g. SEO" 
          value={newTag} 
          onValueChange={setNewTag} 
          isRequired 
        />
        <Button color="primary" type="submit" isLoading={isSubmitting} startContent={<FaPlus />}>
          Add Tag
        </Button>
      </form>

      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden p-2">
        <Table aria-label="Tags table" shadow="none" classNames={{ wrapper: "bg-transparent shadow-none" }}>
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
                <TableCell><span className="font-semibold">{item.name}</span></TableCell>
                <TableCell>
                  <div className="flex justify-end pr-2">
                    <Tooltip color="danger" content="Delete tag">
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
