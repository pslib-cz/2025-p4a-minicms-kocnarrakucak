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
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Prompt</h1>
          <p className="text-zinc-500 mt-1">Update your prompt content and settings.</p>
        </div>

        <PromptForm initialData={prompt} tags={tags} promptTypes={promptTypes} />
      </div>

      {/* Evaluations Section */}
      <div className="pt-8 border-t border-zinc-200 dark:border-zinc-800 space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Model Evaluations & Showcase</h2>
          <p className="text-zinc-500 mt-1">Score how well this prompt works on different AI models and showcase the results.</p>
        </div>

        <EvaluationForm 
          promptId={prompt.id} 
          existingEvaluations={prompt.evaluations}
          models={models} 
        />
      </div>
    </div>
  );
}
