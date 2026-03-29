import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";
import { PromptForm } from "@/components/dashboard/PromptForm";
import { prisma } from "@/lib/prisma";

export default async function NewPromptPage() {
  const [tags, promptTypes] = await Promise.all([
    prisma.tag.findMany({ orderBy: { name: "asc" } }),
    prisma.promptType.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-8">
      <DashboardPageHeader
        eyebrow="Composer"
        title="Create New Prompt"
        description="Design a new prompt template, add metadata and expose variables for the public detail page."
      />
      <PromptForm tags={tags} promptTypes={promptTypes} />
    </div>
  );
}
