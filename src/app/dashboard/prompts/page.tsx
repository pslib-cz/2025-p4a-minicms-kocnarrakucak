"use client";

import { useEffect, useState } from "react";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, User, Chip, Tooltip, Button, Spinner, Pagination } from "@nextui-org/react";
import { FaEdit, FaTrash, FaPlus, FaEye } from "react-icons/fa";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
  const router = useRouter();

  const fetchPrompts = async () => {
    try {
      const res = await fetch("/api/prompts");
      const data = await res.json();
      setPrompts(data);
    } catch (error) {
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Prompts</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">Manage your created prompts</p>
        </div>
        <Button
          as={Link}
          href="/dashboard/prompts/new"
          color="primary"
          startContent={<FaPlus />}
        >
          New Prompt
        </Button>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden p-2">
        <Table aria-label="Prompts table" shadow="none" classNames={{ wrapper: "bg-transparent shadow-none" }}>
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
            emptyContent={isLoading ? " " : "No prompts found. Create your first one!"}
          >
            {(item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <div className="flex flex-col">
                    <p className="text-bold text-sm capitalize">{item.title}</p>
                    <p className="text-bold text-sm capitalize text-zinc-500">/{item.slug}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <Chip size="sm" variant="flat" color="primary">{item.promptType.name}</Chip>
                </TableCell>
                <TableCell>
                  <Chip className="capitalize" color={statusColorMap[item.status]} size="sm" variant="flat">
                    {item.status.toLowerCase()}
                  </Chip>
                </TableCell>
                <TableCell>{new Date(item.updatedAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 justify-center">
                    <Tooltip content="Details">
                      <Link href={`/${item.promptType.slug}/${item.user.username}/${item.slug}`} className="text-lg text-default-400 cursor-pointer active:opacity-50">
                        <FaEye />
                      </Link>
                    </Tooltip>
                    <Tooltip content="Edit prompt">
                      <Link href={`/dashboard/prompts/${item.id}/edit`} className="text-lg text-default-400 cursor-pointer active:opacity-50">
                        <FaEdit />
                      </Link>
                    </Tooltip>
                    <Tooltip color="danger" content="Delete prompt">
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
