import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { VariableInjector } from "@/components/VariableInjector";
import { FaTag, FaStar } from "react-icons/fa";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { auth } from "@/lib/auth";
import { VisitorEvaluationForm } from "@/components/prompt/VisitorEvaluationForm";

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
          include: { aiModel: true },
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

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-50 font-sans pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
            &larr; Back to Explorer
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 pt-12 space-y-12">
        {/* Core Info */}
        <section className="space-y-6">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-4 py-1.5 rounded-full">
              {prompt.promptType.name}
            </span>
            {avgRating ? (
              <div className="flex items-center space-x-2 text-yellow-600 dark:text-yellow-500 font-medium">
                <FaStar />
                <span>{avgRating}</span>
                <span className="text-zinc-400 text-sm">({prompt.evaluations.length} reviews)</span>
              </div>
            ) : (
              <span className="text-zinc-400 text-sm">No ratings yet</span>
            )}
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            {prompt.title}
          </h1>

          <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl">
            {prompt.description || "No description provided."}
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center space-x-2 mr-4">
              <span className="text-sm font-medium">By {prompt.user?.username || prompt.user?.name || "Anonymous"}</span>
            </div>
            {prompt.tags.map((t) => (
              <span key={t.id} className="flex items-center space-x-1 text-xs px-3 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-full text-zinc-600 dark:text-zinc-400">
                <FaTag size={10} />
                <span>{t.name}</span>
              </span>
            ))}
          </div>
        </section>

        {/* System Prompt (if exists) */}
        {prompt.systemPrompt && (
          <section className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">System Context / Persona</h2>
            <div className="prose dark:prose-invert max-w-none text-zinc-600 dark:text-zinc-400">
              <ReactMarkdown>{prompt.systemPrompt}</ReactMarkdown>
            </div>
          </section>
        )}

        {/* Variable Injector (Client Island) */}
        <section>
          <VariableInjector rawPrompt={prompt.userPrompt} />
        </section>

        {/* Visitor Rating Form */}
        {!isAuthor && (
          <section className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Rate this prompt</h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                Share how well this prompt worked with an AI model you tried.
              </p>
            </div>
            {isLoggedIn ? (
              <VisitorEvaluationForm
                promptId={prompt.id}
                models={allModels}
                existingEvaluations={myEvaluations}
              />
            ) : (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                <Link href="/api/auth/signin" className="text-blue-500 hover:underline font-medium">Sign in</Link> to rate this prompt.
              </p>
            )}
          </section>
        )}

        {/* Evaluations & Showcase */}
        {prompt.evaluations.length > 0 && (
          <section className="space-y-6 pt-12 border-t border-zinc-200 dark:border-zinc-800">
            <h2 className="text-2xl font-bold">Model Showcases</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {prompt.evaluations.map((ev) => (
                <article key={ev.id} className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
                  <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-start bg-zinc-50 dark:bg-zinc-900/50">
                    <div>
                      <h3 className="font-bold text-lg">{ev.aiModel.name}</h3>
                      <p className="text-xs text-zinc-500">{ev.aiModel.provider}</p>
                    </div>
                    <div className="flex text-yellow-500 text-sm">
                      {[...Array(5)].map((_, i) => (
                        <FaStar key={i} className={i < ev.rating ? "" : "text-zinc-300 dark:text-zinc-700"} />
                      ))}
                    </div>
                  </div>
                  <div className="p-6">
                    {ev.comment && <p className="text-sm italic text-zinc-600 dark:text-zinc-400">"{ev.comment}"</p>}
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
