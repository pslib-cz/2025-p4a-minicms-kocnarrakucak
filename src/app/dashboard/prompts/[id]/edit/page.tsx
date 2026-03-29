import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";
import { DashboardPanel } from "@/components/dashboard/DashboardPanel";
import { PromptForm } from "@/components/dashboard/PromptForm";
import { EvaluationForm } from "@/components/dashboard/EvaluationForm";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function EditPromptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const { id } = await params;

  const [prompt, tags, models, promptTypes] = await Promise.all([
    prisma.prompt.findUnique({
      where: { id },
      include: {
        tags: true,
        evaluations: {
          include: { aiModel: true },
        },
      },
    }),
    prisma.tag.findMany({ orderBy: { name: "asc" } }),
    prisma.aiModel.findMany({ orderBy: { name: "asc" } }),
    prisma.promptType.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!prompt || prompt.userId !== session.user.id) {
    notFound();
  }

  return (
      <div className="space-y-12">
      <div className="space-y-8">
        <DashboardPageHeader
          eyebrow="Composer"
          title="Edit Prompt"
          description="Update metadata, prompt body and publishing status without leaving the dashboard flow."
        />

        <PromptForm initialData={prompt} tags={tags} promptTypes={promptTypes} />
      </div>

      <DashboardPanel className="space-y-6">
        <div className="space-y-2">
          <p className="text-[12px] uppercase tracking-[0.18em] text-muted">Evaluations</p>
          <h2 className="text-[24px] font-medium text-foreground">Model evaluations and showcase</h2>
          <p className="text-[14px] leading-[1.7] text-muted">
            Score how well this prompt works on different AI models and keep the comparison visible in one place.
          </p>
        </div>

        <EvaluationForm
          promptId={prompt.id}
          existingEvaluations={prompt.evaluations}
          models={models}
        />
      </DashboardPanel>
    </div>
  );
}
