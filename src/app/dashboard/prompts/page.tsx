"use client";

import { useEffect, useState } from "react";
import {
  Button,
  Chip,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Tooltip,
} from "@nextui-org/react";
import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";
import { DashboardPanel } from "@/components/dashboard/DashboardPanel";
import { FaEdit, FaTrash, FaPlus, FaEye } from "react-icons/fa";
import Link from "next/link";

type Prompt = {
  id: string;
  title: string;
  promptType: { slug: string; name: string };
  user: { username: string };
  status: string;
  updatedAt: string;
  slug: string;
};

export default function PromptsClientPage() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const fetchPrompts = async () => {
    try {
      setLoadError(null);

      const res = await fetch("/api/prompts", { cache: "no-store" });
      const data = await res.json();

      if (!res.ok) {
        setPrompts([]);
        setLoadError(typeof data?.error === "string" ? data.error : "Failed to load prompts.");
        return;
      }

      if (!Array.isArray(data)) {
        setPrompts([]);
        setLoadError("Unexpected response while loading prompts.");
        return;
      }

      setPrompts(data);
    } catch (error) {
      setPrompts([]);
      setLoadError("Failed to load prompts.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPrompts();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this prompt?")) return;
    
    try {
      const res = await fetch(`/api/prompts/${id}`, { method: "DELETE" });
      if (res.ok) {
        setPrompts((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const statusColorMap: Record<string, "success" | "warning"> = {
    PUBLISHED: "success",
    DRAFT: "warning",
  };

  const publishedCount = prompts.filter((prompt) => prompt.status === "PUBLISHED").length;
  const draftCount = prompts.filter((prompt) => prompt.status === "DRAFT").length;

  return (
    <div className="space-y-8">
      <DashboardPageHeader
        eyebrow="Inventory"
        title="My Prompts"
        description="Manage prompt slugs, publishing status and quick links into the public library."
        action={
          <Button
            as={Link}
            href="/dashboard/prompts/new"
            startContent={<FaPlus />}
            className="h-12 rounded-full border border-white/8 bg-[#0f0f0e] px-5 text-[13px] text-foreground shadow-[0_18px_35px_rgba(0,0,0,0.2)]"
          >
            New Prompt
          </Button>
        }
      />

      <DashboardPanel className="space-y-5">
        <div className="flex flex-wrap items-center gap-3 text-[13px] text-muted">
          <span className="rounded-full border border-border bg-[#0f0f0e] px-4 py-2 text-foreground">
            Total prompts: {prompts.length}
          </span>
          <span className="rounded-full border border-border px-4 py-2">
            Published: {publishedCount}
          </span>
          <span className="rounded-full border border-border px-4 py-2">
            Drafts: {draftCount}
          </span>
        </div>

        <div className="overflow-hidden rounded-[24px] border border-border/80 bg-[rgba(255,255,255,0.02)] p-2">
          <Table
            aria-label="Prompts table"
            shadow="none"
            classNames={{
              base: "bg-transparent",
              wrapper: "bg-transparent shadow-none p-0",
              th: "bg-transparent text-muted text-[11px] uppercase tracking-[0.18em] border-b border-border/80",
              td: "border-b border-border/70 py-4",
              tr: "data-[hover=true]:bg-white/0",
            }}
          >
            <TableHeader>
              <TableColumn>TITLE</TableColumn>
              <TableColumn>TYPE</TableColumn>
              <TableColumn>STATUS</TableColumn>
              <TableColumn>LAST UPDATED</TableColumn>
              <TableColumn align="center">ACTIONS</TableColumn>
            </TableHeader>
            <TableBody
              items={prompts}
              isLoading={isLoading}
              loadingContent={<Spinner label="Loading..." />}
              emptyContent={isLoading ? " " : loadError ?? "No prompts found. Create your first one!"}
            >
              {(item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <p className="text-[14px] text-foreground">{item.title}</p>
                      <p className="mt-1 text-[12px] uppercase tracking-[0.16em] text-muted">
                        /{item.slug}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="sm"
                      variant="flat"
                      classNames={{
                        base: "border border-border bg-[rgba(255,255,255,0.03)]",
                        content: "text-[12px] text-foreground",
                      }}
                    >
                      {item.promptType.name}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <Chip
                      className="capitalize"
                      color={statusColorMap[item.status]}
                      size="sm"
                      variant="flat"
                    >
                      {item.status.toLowerCase()}
                    </Chip>
                  </TableCell>
                  <TableCell className="text-[13px] text-muted">
                    {new Date(item.updatedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-2">
                      <Tooltip content="Details">
                        <Link
                          href={`/${item.promptType.slug}/${item.user.username}/${item.slug}`}
                          className="flex size-9 items-center justify-center rounded-full border border-border text-muted transition hover:text-foreground active:opacity-50"
                        >
                          <FaEye />
                        </Link>
                      </Tooltip>
                      <Tooltip content="Edit prompt">
                        <Link
                          href={`/dashboard/prompts/${item.id}/edit`}
                          className="flex size-9 items-center justify-center rounded-full border border-border text-muted transition hover:text-foreground active:opacity-50"
                        >
                          <FaEdit />
                        </Link>
                      </Tooltip>
                      <Tooltip color="danger" content="Delete prompt">
                        <span
                          onClick={() => handleDelete(item.id)}
                          className="flex size-9 cursor-pointer items-center justify-center rounded-full border border-border text-danger transition active:opacity-50"
                        >
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
      </DashboardPanel>
    </div>
  );
}
