"use client";

import { useEffect, useEffectEvent, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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

type PromptListResponse = {
  items: Prompt[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    pageCount: number;
  };
  summary: {
    all: number;
    published: number;
    draft: number;
  };
};

function parsePage(value: string | null) {
  const parsed = Number.parseInt(value || "1", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

export default function PromptsClientPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [pageCount, setPageCount] = useState(1);
  const [totalPrompts, setTotalPrompts] = useState(0);
  const [summary, setSummary] = useState({ all: 0, published: 0, draft: 0 });
  const [reloadKey, setReloadKey] = useState(0);

  const currentPage = parsePage(searchParams.get("page"));

  const updatePage = (nextPage: number) => {
    const params = new URLSearchParams(searchParams.toString());

    if (nextPage <= 1) {
      params.delete("page");
    } else {
      params.set("page", String(nextPage));
    }

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const fetchPrompts = useEffectEvent(async (page: number) => {
    try {
      setLoadError(null);

      const res = await fetch(`/api/prompts?page=${page}&pageSize=8`, { cache: "no-store" });
      const data: unknown = await res.json();

      if (!res.ok) {
        setPrompts([]);
        const errorMessage =
          typeof data === "object" &&
          data !== null &&
          "error" in data &&
          typeof data.error === "string"
            ? data.error
            : "Failed to load prompts.";
        setLoadError(errorMessage);
        return;
      }

      if (
        typeof data !== "object" ||
        data === null ||
        !("items" in data) ||
        !Array.isArray(data.items) ||
        !("pagination" in data) ||
        !("summary" in data)
      ) {
        setPrompts([]);
        setLoadError("Unexpected response while loading prompts.");
        return;
      }

      const response = data as PromptListResponse;

      setPrompts(response.items);
      setTotalPrompts(response.pagination.total);
      setPageCount(response.pagination.pageCount);
      setSummary(response.summary);

      if (response.pagination.page !== page) {
        updatePage(response.pagination.page);
      }
    } catch (error) {
      setPrompts([]);
      setLoadError("Failed to load prompts.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  });

  useEffect(() => {
    fetchPrompts(currentPage);
  }, [currentPage, reloadKey]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this prompt?")) return;
    
    try {
      const res = await fetch(`/api/prompts/${id}`, { method: "DELETE" });
      if (res.ok) {
        setReloadKey((current) => current + 1);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const statusColorMap: Record<string, "success" | "warning"> = {
    PUBLISHED: "success",
    DRAFT: "warning",
  };

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
            className="h-12 rounded-full border border-border bg-surface-strong px-5 text-[13px] text-foreground shadow-[0_18px_35px_rgba(0,0,0,0.16)] transition hover:bg-panel"
          >
            New Prompt
          </Button>
        }
      />

      <DashboardPanel className="space-y-5">
        <div className="flex flex-wrap items-center gap-3 text-[13px] text-muted">
          <span className="rounded-full border border-border bg-surface-strong px-4 py-2 text-foreground">
            Total prompts: {summary.all}
          </span>
          <span className="rounded-full border border-border px-4 py-2">
            Published: {summary.published}
          </span>
          <span className="rounded-full border border-border px-4 py-2">
            Drafts: {summary.draft}
          </span>
          <span className="rounded-full border border-border px-4 py-2">
            Page {currentPage} of {pageCount}
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
              td: "border-b border-border/70 py-4 align-middle",
              tr: "data-[hover=true]:bg-white/0",
            }}
          >
            <TableHeader>
              <TableColumn className="w-[40%]">TITLE</TableColumn>
              <TableColumn className="w-[16%]">TYPE</TableColumn>
              <TableColumn className="w-[16%]">STATUS</TableColumn>
              <TableColumn className="w-[16%]">LAST UPDATED</TableColumn>
              <TableColumn align="end" className="w-[12%]">
                ACTIONS
              </TableColumn>
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
                    <div className="min-w-0 space-y-1">
                      <p className="truncate text-[14px] text-foreground">{item.title}</p>
                      <p className="truncate text-[12px] uppercase tracking-[0.16em] text-muted">
                        /{item.slug}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-start">
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
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-start">
                      <Chip
                        className="capitalize"
                        color={statusColorMap[item.status]}
                        size="sm"
                        variant="flat"
                      >
                        {item.status.toLowerCase()}
                      </Chip>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="whitespace-nowrap text-[13px] text-muted">
                      {new Date(item.updatedAt).toLocaleDateString()}
                    </p>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
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
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          className="flex size-9 cursor-pointer items-center justify-center rounded-full border border-border text-danger transition active:opacity-50"
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

        {pageCount > 1 && (
          <div className="flex flex-col gap-3 border-t border-border/80 pt-4 text-[13px] text-muted md:flex-row md:items-center md:justify-between">
            <p>
              Showing page {currentPage} of {pageCount}. Total matching prompts: {totalPrompts}.
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="flat"
                isDisabled={currentPage <= 1}
                onPress={() => updatePage(currentPage - 1)}
                className="rounded-full border border-border bg-surface px-4 text-[12px] text-muted"
              >
                Previous
              </Button>
              <span className="rounded-full border border-border bg-surface-strong px-4 py-2 text-[12px] text-foreground">
                {currentPage} / {pageCount}
              </span>
              <Button
                variant="flat"
                isDisabled={currentPage >= pageCount}
                onPress={() => updatePage(currentPage + 1)}
                className="rounded-full border border-border bg-surface px-4 text-[12px] text-muted"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </DashboardPanel>
    </div>
  );
}
