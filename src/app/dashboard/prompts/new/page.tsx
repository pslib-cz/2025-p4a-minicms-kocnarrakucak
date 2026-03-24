import { PromptForm } from "@/components/dashboard/PromptForm";
import { prisma } from "@/lib/prisma";

export default async function NewPromptPage() {
  const [tags, models, promptTypes] = await Promise.all([
    prisma.tag.findMany({ orderBy: { name: "asc" } }),
    prisma.aiModel.findMany({ orderBy: { name: "asc" } }),
    prisma.promptType.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create New Prompt</h1>
        <p className="text-zinc-500 mt-1">Design your prompt and use {"{{ variable }}"} syntax to make it dynamic.</p>
      </div>

      <PromptForm tags={tags} models={models} promptTypes={promptTypes} />
    </div>
  );
}
