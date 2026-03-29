import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";
import { DashboardPanel } from "@/components/dashboard/DashboardPanel";
import { DashboardStatCard } from "@/components/dashboard/DashboardStatCard";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { FaArrowRight, FaList, FaPlus, FaRobot, FaTags } from "react-icons/fa";

export default async function DashboardHome() {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  const [promptsCount, publishedPrompts, draftPrompts, tagsCount, modelsCount, recentPrompts] =
    await Promise.all([
      prisma.prompt.count({ where: { userId: session.user.id } }),
      prisma.prompt.count({ where: { userId: session.user.id, status: "PUBLISHED" } }),
      prisma.prompt.count({ where: { userId: session.user.id, status: "DRAFT" } }),
      prisma.tag.count(),
      prisma.aiModel.count(),
      prisma.prompt.findMany({
        where: { userId: session.user.id },
        orderBy: { updatedAt: "desc" },
        take: 4,
        select: {
          id: true,
          title: true,
          status: true,
          updatedAt: true,
        },
      }),
    ]);

  return (
    <div className="space-y-8">
      <DashboardPageHeader
        eyebrow="Workspace"
        title={`Overview, ${session.user.name || "Creator"}`}
        description="This is your control room for published prompts, draft inventory and the taxonomy behind the public library."
        action={
          <Link
            href="/dashboard/prompts/new"
            className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-[#0f0f0e] px-5 py-3 text-[13px] text-foreground shadow-[0_18px_35px_rgba(0,0,0,0.2)] transition hover:bg-[#181816]"
          >
            <FaPlus size={12} />
            <span>Create prompt</span>
          </Link>
        }
      />

      <DashboardPanel className="overflow-hidden">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,0.9fr)]">
          <div className="space-y-5">
            <div className="space-y-2">
              <p className="text-[12px] uppercase tracking-[0.18em] text-muted">Publishing status</p>
              <h2 className="text-[28px] font-medium leading-tight text-foreground">
                {publishedPrompts} published, {draftPrompts} still in progress.
              </h2>
              <p className="max-w-[42rem] text-[14px] leading-[1.7] text-muted">
                Use the dashboard to keep the public library polished while iterating on drafts privately.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 text-[13px] text-muted">
              <span className="rounded-full border border-border bg-[#0f0f0e] px-4 py-2 text-foreground">
                Total prompts: {promptsCount}
              </span>
              <span className="rounded-full border border-border px-4 py-2">
                Global tags: {tagsCount}
              </span>
              <span className="rounded-full border border-border px-4 py-2">
                AI models: {modelsCount}
              </span>
            </div>
          </div>

          <div className="rounded-[26px] border border-border/80 bg-[#0f0f0e] p-5">
            <p className="text-[12px] uppercase tracking-[0.18em] text-muted">Next up</p>
            <div className="mt-4 space-y-4 text-[14px] leading-[1.7] text-muted">
              <p>Keep prompt metadata clean so public routes, SEO and filtering stay consistent.</p>
              <p>Admin screens for tags and models are shared assets for the whole catalog.</p>
            </div>
            <Link
              href="/dashboard/prompts"
              className="mt-5 inline-flex items-center gap-2 text-[13px] text-foreground transition hover:text-muted"
            >
              <span>Open prompt inventory</span>
              <FaArrowRight size={11} />
            </Link>
          </div>
        </div>
      </DashboardPanel>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <DashboardStatCard
          icon={<FaList size={16} />}
          label="My Prompts"
          value={promptsCount}
          description="Your total prompt inventory across drafts and published content."
          action={
            <Link
              href="/dashboard/prompts"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-[#0f0f0e] px-4 py-2 text-[12px] text-foreground transition hover:bg-[#181816]"
            >
              <span>View prompts</span>
              <FaArrowRight size={10} />
            </Link>
          }
        />
        <DashboardStatCard
          icon={<FaTags size={16} />}
          label="Global Tags"
          value={tagsCount}
          description="Shared categorization used by filters, prompt discovery and editorial consistency."
          action={
            <Link
              href="/dashboard/tags"
              className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-[12px] text-muted transition hover:text-foreground"
            >
              <span>Manage tags</span>
              <FaArrowRight size={10} />
            </Link>
          }
        />
        <DashboardStatCard
          icon={<FaRobot size={16} />}
          label="AI Models"
          value={modelsCount}
          description="Evaluation targets used to compare prompt quality across supported models."
          action={
            <Link
              href="/dashboard/ai-models"
              className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-[12px] text-muted transition hover:text-foreground"
            >
              <span>Manage models</span>
              <FaArrowRight size={10} />
            </Link>
          }
        />
      </div>

      <DashboardPanel>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <p className="text-[12px] uppercase tracking-[0.18em] text-muted">Recent updates</p>
            <h2 className="text-[24px] font-medium text-foreground">Latest prompt activity</h2>
          </div>

          <div className="w-full max-w-[38rem] space-y-3">
            {recentPrompts.length === 0 ? (
              <p className="text-[14px] text-muted">
                No prompts yet. Create the first one to start shaping the library.
              </p>
            ) : (
              recentPrompts.map((prompt) => (
                <div
                  key={prompt.id}
                  className="flex items-center justify-between gap-4 rounded-[20px] border border-border/80 bg-[rgba(255,255,255,0.02)] px-4 py-4"
                >
                  <div className="min-w-0">
                    <p className="truncate text-[15px] text-foreground">{prompt.title}</p>
                    <p className="mt-1 text-[12px] uppercase tracking-[0.16em] text-muted">
                      {prompt.status.toLowerCase()} · {new Date(prompt.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Link
                    href={`/dashboard/prompts/${prompt.id}/edit`}
                    className="shrink-0 rounded-full border border-border px-4 py-2 text-[12px] text-muted transition hover:text-foreground"
                  >
                    Edit
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      </DashboardPanel>
    </div>
  );
}
