import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { VariableInjector } from "@/components/VariableInjector";
import { FaArrowLeft, FaArrowRight, FaRegUser, FaStar, FaTag } from "react-icons/fa";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { auth } from "@/lib/auth";
import { VisitorEvaluationForm } from "@/components/prompt/VisitorEvaluationForm";
import { PromptEvaluations } from "@/components/prompt/prompt-evaluations";

export default async function PromptDetailPage({
  params,
}: {
  params: Promise<{ type: string; user: string; slug: string }>;
}) {
  const { type, user, slug } = await params;

  const [session, allModels, prompt] = await Promise.all([
    auth(),
    prisma.aiModel.findMany({ orderBy: { name: "asc" } }),
    prisma.prompt.findFirst({
      where: { slug, user: { username: user } },
      include: {
        user: true,
        tags: true,
        promptType: true,
        evaluations: {
          include: {
            aiModel: true,
            user: {
              select: {
                id: true,
                name: true,
                username: true,
              },
            },
          },
        },
      },
    }),
  ]);

  if (
    !prompt ||
    prompt.status !== "PUBLISHED" ||
    prompt.promptType.slug !== type.toLowerCase() ||
    prompt.user.username !== user.toLowerCase()
  ) {
    notFound();
  }

  const isAuthor = session?.user?.id === prompt.userId;
  const isLoggedIn = !!session?.user?.id;
  const currentUserRole = session?.user?.role;

  // Evaluations submitted by the current user for this prompt
  const myEvaluations = isLoggedIn
    ? prompt.evaluations.filter((e) => e.userId === session!.user!.id)
    : [];

  const avgRating =
    prompt.evaluations.length > 0
      ? (
          prompt.evaluations.reduce((acc, curr) => acc + curr.rating, 0) /
          prompt.evaluations.length
        ).toFixed(1)
      : null;

  const panelClassName =
    "rounded-[32px] border border-border/80 bg-surface/90 p-6 shadow-[0_24px_60px_rgba(0,0,0,0.16)] backdrop-blur-sm md:p-8";

  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-background pb-24 text-foreground">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 14% 10%, rgba(255,255,255,0.08), transparent 18%), radial-gradient(circle at 84% 10%, rgba(255,255,255,0.05), transparent 14%), linear-gradient(180deg, var(--background) 0%, color-mix(in srgb, var(--surface) 94%, transparent) 18%, color-mix(in srgb, var(--surface-strong) 90%, transparent) 40%, color-mix(in srgb, var(--panel) 68%, var(--background) 32%) 66%, color-mix(in srgb, var(--surface) 82%, var(--background) 18%) 100%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-[18rem] h-[28rem] blur-3xl"
        style={{
          background:
            "linear-gradient(135deg, color-mix(in srgb, var(--panel) 10%, transparent) 0%, color-mix(in srgb, var(--panel-strong) 40%, transparent) 48%, color-mix(in srgb, var(--panel-strong) 42%, transparent) 100%)",
        }}
      />

      <header className="relative z-20 border-b border-white/5 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-5 py-4 md:px-8 xl:px-14">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-[13px] text-foreground transition hover:bg-surface-strong"
          >
            <FaArrowLeft size={11} />
            <span>Back to explorer</span>
          </Link>

          {isAuthor && (
            <Link
              href={`/dashboard/prompts/${prompt.id}/edit`}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-strong px-4 py-2 text-[13px] text-foreground shadow-[0_18px_35px_rgba(0,0,0,0.16)] transition hover:bg-panel"
            >
              <span>Edit prompt</span>
              <FaArrowRight size={11} />
            </Link>
          )}
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-[1500px] space-y-12 px-5 pt-10 md:px-8 xl:px-14 xl:pt-14">
        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.75fr)]">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3 text-[13px] text-muted">
              <span className="rounded-full border border-border bg-surface-strong px-4 py-2 text-foreground">
                {prompt.promptType.name}
              </span>
              <span className="rounded-full border border-border px-4 py-2">
                {avgRating ? `${avgRating} / 5` : "Unrated"}
              </span>
              <span className="rounded-full border border-border px-4 py-2">
                {prompt.evaluations.length} reviews
              </span>
            </div>

            <div className="space-y-4">
              <h1 className="max-w-[16ch] text-[40px] font-semibold leading-[0.94] tracking-[-0.06em] text-foreground md:text-[56px] xl:text-[64px]">
                {prompt.title}
              </h1>
              <p className="max-w-[58rem] text-[18px] leading-[1.7] text-muted md:text-[20px]">
                {prompt.description || "No description provided."}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 border-t border-border/80 pt-5 text-[13px] text-muted">
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2">
                <FaRegUser size={11} />
                <span>{prompt.user.name || prompt.user.username}</span>
              </span>
              {prompt.tags.map((tagItem) => (
                <span
                  key={tagItem.id}
                  className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2"
                >
                  <FaTag size={10} />
                  <span>{tagItem.name}</span>
                </span>
              ))}
            </div>
          </div>

          <div className={panelClassName}>
            <div className="space-y-4">
              <p className="text-[12px] uppercase tracking-[0.18em] text-muted">Prompt Overview</p>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                <div className="rounded-[24px] border border-border/80 bg-[rgba(255,255,255,0.02)] p-4">
                  <p className="text-[12px] uppercase tracking-[0.16em] text-muted">Average rating</p>
                  <p className="mt-3 flex items-center gap-2 text-[28px] font-medium text-foreground">
                    <FaStar className="text-[18px] text-yellow-400" />
                    <span>{avgRating || "New"}</span>
                  </p>
                </div>
                <div className="rounded-[24px] border border-border/80 bg-[rgba(255,255,255,0.02)] p-4">
                  <p className="text-[12px] uppercase tracking-[0.16em] text-muted">Route</p>
                  <p className="mt-3 text-[14px] leading-[1.7] text-foreground">
                    /{prompt.promptType.slug}/{prompt.user.username}/{prompt.slug}
                  </p>
                </div>
              </div>
              <p className="text-[13px] leading-[1.7] text-muted">
                Fill the variables below to build a ready-to-copy prompt, then rate the result with the model you used.
              </p>
            </div>
          </div>
        </section>

        {prompt.systemPrompt && (
          <section className={panelClassName}>
            <div className="space-y-2">
              <p className="text-[12px] uppercase tracking-[0.18em] text-muted">System Prompt</p>
              <h2 className="text-[24px] font-medium text-foreground">Context and persona</h2>
            </div>
            <div className="mt-5 space-y-4 text-[14px] leading-[1.85] text-muted [&_h1]:text-[22px] [&_h1]:font-medium [&_h1]:text-foreground [&_h2]:text-[18px] [&_h2]:font-medium [&_h2]:text-foreground [&_p]:leading-[1.85]">
              <ReactMarkdown>{prompt.systemPrompt}</ReactMarkdown>
            </div>
          </section>
        )}

        <section className="space-y-4">
          <div className="space-y-2">
            <p className="text-[12px] uppercase tracking-[0.18em] text-muted">Prompt Builder</p>
            <h2 className="text-[24px] font-medium text-foreground">Inject variables and copy the final prompt</h2>
          </div>
          <VariableInjector rawPrompt={prompt.userPrompt} />
        </section>

        {!isAuthor && (
          <section className={panelClassName}>
            <div className="space-y-2">
              <p className="text-[12px] uppercase tracking-[0.18em] text-muted">Your Evaluation</p>
              <h2 className="text-[24px] font-medium text-foreground">Rate this prompt</h2>
              <p className="text-[14px] leading-[1.7] text-muted">
                Share how well this prompt worked with an AI model you tried.
              </p>
            </div>

            <div className="mt-6">
              {isLoggedIn ? (
                <VisitorEvaluationForm
                  promptId={prompt.id}
                  models={allModels}
                  existingEvaluations={myEvaluations}
                />
              ) : (
                <p className="text-[14px] text-muted">
                  <Link
                    href="/api/auth/signin"
                    className="text-foreground underline underline-offset-4"
                  >
                    Sign in
                  </Link>{" "}
                  to rate this prompt.
                </p>
              )}
            </div>
          </section>
        )}

        {prompt.evaluations.length > 0 && (
          <section className="space-y-6">
            <div className="space-y-2">
              <p className="text-[12px] uppercase tracking-[0.18em] text-muted">Showcase</p>
              <h2 className="text-[24px] font-medium text-foreground">Model showcases</h2>
            </div>
            <PromptEvaluations
              promptId={prompt.id}
              promptOwnerId={prompt.userId}
              currentUserId={session?.user?.id}
              currentUserRole={currentUserRole}
              evaluations={prompt.evaluations}
              panelClassName={panelClassName}
            />
          </section>
        )}
      </main>
    </div>
  );
}
