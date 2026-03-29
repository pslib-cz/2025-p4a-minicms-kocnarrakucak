import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  FaArrowRight,
  FaCookieBite,
  FaRegClone,
  FaRegUser,
  FaSearch,
  FaStar,
  FaTags,
} from "react-icons/fa";

type PromptCardItem = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  userPrompt: string;
  promptType: { name: string; slug: string };
  tags: { id: string; name: string }[];
  user: { name: string | null; username: string };
  evaluations: { rating: number }[];
};

function normalizeCopy(value: string) {
  return value
    .replace(/[`*_>#-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function buildExcerpt(prompt: PromptCardItem, length: number) {
  const source = normalizeCopy(prompt.description || prompt.userPrompt);
  return source.length > length ? `${source.slice(0, length).trim()}...` : source;
}

function buildPromptHref(prompt: PromptCardItem) {
  return `/${prompt.promptType.slug}/${prompt.user.username}/${prompt.slug}`;
}

function buildRatingLabel(prompt: PromptCardItem) {
  if (!prompt.evaluations.length) {
    return "Unrated";
  }

  const average =
    prompt.evaluations.reduce((acc, evaluation) => acc + evaluation.rating, 0) /
    prompt.evaluations.length;

  return `${average.toFixed(1)} / 5`;
}

function buildPromptVariant(prompt: PromptCardItem) {
  if (prompt.promptType.slug.includes("image")) {
    return "image";
  }

  if (prompt.promptType.slug.includes("code")) {
    return "code";
  }

  return "text";
}

function PreviewPanel({
  prompt,
  featured = false,
}: {
  prompt: PromptCardItem;
  featured?: boolean;
}) {
  const variant = buildPromptVariant(prompt);
  const excerpt = buildExcerpt(prompt, featured ? 220 : 150);

  if (variant === "image") {
    return (
      <div
        className={`grid gap-4 rounded-[22px] border border-border/80 bg-black/20 p-4 ${
          featured ? "md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]" : ""
        }`}
      >
        <div className="min-h-[180px] rounded-[18px] border border-border/80 bg-[radial-gradient(circle_at_28%_22%,rgba(245,245,245,0.36),transparent_26%),radial-gradient(circle_at_68%_38%,rgba(255,255,255,0.18),transparent_18%),linear-gradient(140deg,#070707_16%,#3e3d39_61%,#141414_100%)]" />
        <div className="space-y-3 text-[14px] leading-[1.6] text-muted">
          <p>{excerpt}</p>
          <p className="text-muted-soft">
            Visual prompts get a large preview surface in the library grid.
          </p>
        </div>
      </div>
    );
  }

  if (variant === "code") {
    const codeLines = [
      buildExcerpt(prompt, featured ? 56 : 40),
      normalizeCopy(prompt.userPrompt).slice(0, featured ? 52 : 34),
      normalizeCopy(prompt.description || "Structured output for code generation").slice(
        0,
        featured ? 48 : 32
      ),
    ].filter(Boolean);

    return (
      <div className="rounded-[22px] border border-border/80 bg-black/20 p-4">
        <div className="space-y-3 text-[13px] leading-[1.7] text-muted">
          {codeLines.map((line, index) => (
            <p key={`${prompt.id}-${index}`} className="max-w-[28ch]">
              {line}
            </p>
          ))}
        </div>
        <div className="mt-5 border-t border-border/70 pt-4 text-[13px] text-muted-soft">
          Template blocks, variables and structured output stay visible in one card.
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[22px] border border-border/80 bg-black/20 p-4">
      <p className="text-[13px] uppercase tracking-[0.18em] text-muted-soft">Prompt</p>
      <p className="mt-3 text-[14px] leading-[1.6] text-muted">{excerpt}</p>
      <div className="mt-5 border-t border-border/70 pt-4">
        <p className="text-[24px] font-medium leading-none text-foreground">Output</p>
        <p className="mt-3 text-[14px] leading-[1.6] text-muted">
          {buildExcerpt(
            {
              ...prompt,
              description:
                prompt.description || "Structured response, reasoning or final answer preview.",
            },
            featured ? 120 : 90
          )}
        </p>
      </div>
    </div>
  );
}

function PromptCard({
  prompt,
  featured = false,
}: {
  prompt: PromptCardItem;
  featured?: boolean;
}) {
  return (
    <Link
      href={buildPromptHref(prompt)}
      className={`group flex h-full flex-col rounded-[28px] border border-border/80 bg-surface px-5 pb-5 pt-4 shadow-[0_16px_40px_rgba(0,0,0,0.18)] transition duration-300 hover:-translate-y-1 hover:border-foreground/40 hover:bg-surface-strong ${
        featured ? "min-h-[340px]" : "min-h-[320px]"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-[12px] uppercase tracking-[0.18em] text-muted">
            {prompt.promptType.name}
          </p>
          <h3 className="text-[24px] font-medium leading-[1.05] text-foreground">
            {prompt.title}
          </h3>
        </div>
        <span className="flex size-8 items-center justify-center rounded-full border border-border text-muted transition group-hover:text-foreground">
          <FaRegClone size={12} />
        </span>
      </div>

      <p className="mt-4 text-[14px] leading-[1.6] text-muted">
        {buildExcerpt(prompt, featured ? 95 : 78)}
      </p>

      <div className="mt-5 flex-1">
        <PreviewPanel prompt={prompt} featured={featured} />
      </div>

      <div className="mt-5 flex flex-wrap items-end justify-between gap-3 border-t border-border/80 pt-4 text-[13px] text-muted">
        <div className="space-y-1">
          <p>{prompt.user.name || prompt.user.username}</p>
          <p className="flex items-center gap-2">
            <FaStar className="text-[11px]" />
            <span>{buildRatingLabel(prompt)}</span>
          </p>
        </div>

        <div className="max-w-[16rem] text-right">
          <p className="flex items-center justify-end gap-2">
            <FaTags className="text-[11px]" />
            <span>{prompt.tags.slice(0, 2).map((tag) => tag.name).join(" / ") || "General"}</span>
          </p>
        </div>
      </div>
    </Link>
  );
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tag?: string }>;
}) {
  const { q, tag } = await searchParams;

  const where: Prisma.PromptWhereInput = { status: "PUBLISHED" };
  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { userPrompt: { contains: q, mode: "insensitive" } },
    ];
  }
  if (tag) {
    where.tags = { some: { name: tag } };
  }

  let prompts: PromptCardItem[] = [];
  let allTags: { id: string; name: string }[] = [];
  let isDataUnavailable = false;

  try {
    [prompts, allTags] = await Promise.all([
      prisma.prompt.findMany({
        where,
        orderBy: { publishDate: "desc" },
        include: {
          promptType: true,
          tags: true,
          user: { select: { name: true, username: true } },
          evaluations: { select: { rating: true } },
        },
      }),
      prisma.tag.findMany({ orderBy: { name: "asc" } }),
    ]);
  } catch (error) {
    isDataUnavailable = true;

    if (process.env.NODE_ENV === "development") {
      console.error("Homepage data is unavailable. Check DATABASE_URL and auth env vars.", error);
    }
  }

  const featuredPrompts = prompts.slice(0, 3);
  const visibleTags = allTags.slice(0, 8);

  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_12%,rgba(255,255,255,0.08),transparent_18%),radial-gradient(circle_at_78%_12%,rgba(255,255,255,0.05),transparent_14%),linear-gradient(180deg,#181816_0%,#1b1b19_18%,#23221e_38%,#312f2a_56%,#3a3731_70%,#2f2c27_86%,#27241f_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-[20rem] h-[30rem] bg-[linear-gradient(135deg,rgba(59,58,54,0.1)_0%,rgba(84,82,76,0.56)_48%,rgba(98,95,88,0.68)_100%)] [clip-path:polygon(0_78%,35%_100%,100%_58%,100%_100%,0_100%)] blur-2xl" />
      <div className="pointer-events-none absolute inset-x-0 top-[30rem] h-[52rem] bg-[linear-gradient(180deg,rgba(96,92,84,0)_0%,rgba(96,92,84,0.12)_18%,rgba(88,83,75,0.34)_46%,rgba(62,58,52,0.72)_76%,rgba(41,38,33,0.94)_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-[-8rem] h-[30rem] bg-[radial-gradient(circle_at_50%_0%,rgba(120,113,102,0.14),transparent_42%),linear-gradient(180deg,rgba(40,37,33,0)_0%,rgba(40,37,33,0.68)_62%,rgba(30,28,24,0.96)_100%)]" />

      <main className="relative z-10">
        <section className="mx-auto max-w-[1500px] px-5 pb-24 pt-8 md:px-8 xl:px-14 xl:pt-12">
          <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
            <div className="max-w-[860px]">
              <h1 className="text-[42px] font-semibold leading-[0.95] tracking-[-0.06em] text-foreground md:text-[56px] xl:text-[64px]">
                Artificial Intelligence Library
              </h1>
              <p className="mt-4 max-w-[760px] text-[20px] font-normal leading-[1.35] text-muted md:text-[24px]">
                The best AI prompts out there, here for you.
              </p>
            </div>

            <div className="md:pt-2">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-3 rounded-full bg-[#0c0c0b] px-5 py-3 text-[14px] text-foreground shadow-[0_18px_45px_rgba(0,0,0,0.38)] ring-1 ring-white/6 transition hover:bg-[#141413]"
                aria-label="Account"
              >
                <span>Account</span>
                <span className="flex size-8 items-center justify-center rounded-full bg-[#161615] ring-1 ring-white/8">
                  <FaRegUser size={13} />
                </span>
              </Link>
            </div>
          </div>

          {featuredPrompts.length > 0 && (
            <div className="mt-16 grid gap-5 xl:grid-cols-3">
              {featuredPrompts.map((prompt) => (
                <PromptCard key={`featured-${prompt.id}`} prompt={prompt} featured />
              ))}
            </div>
          )}
        </section>

        <section className="mx-auto max-w-[1200px] px-5 pb-10 md:px-8">
          {isDataUnavailable && (
            <div className="mx-auto mb-6 max-w-[720px] rounded-[20px] border border-border bg-surface px-4 py-3 text-center text-[13px] text-muted shadow-[0_18px_40px_rgba(0,0,0,0.2)]">
              Demo mode: public data is unavailable locally. Configure `DATABASE_URL`, auth secret and OAuth env
              vars to load real prompts.
            </div>
          )}

          <form
            className="mx-auto flex max-w-[560px] items-center gap-3 rounded-full bg-[#0c0c0b] px-4 py-3 shadow-[0_22px_55px_rgba(0,0,0,0.34)] ring-1 ring-white/6"
            action="/"
          >
            <FaSearch className="shrink-0 text-muted" size={18} />
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Looking for something specific?"
              className="min-w-0 flex-1 bg-transparent text-[14px] text-foreground outline-none placeholder:text-muted"
            />
            {tag && <input type="hidden" name="tag" value={tag} />}
            <button
              type="submit"
              className="flex size-9 items-center justify-center rounded-full bg-[#161615] text-foreground shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] transition hover:bg-[#1b1b1a]"
              aria-label="Search prompts"
            >
              <FaArrowRight size={12} />
            </button>
          </form>

          <div className="mt-8 text-center">
            <h2 className="text-[24px] font-medium leading-[1.1] text-foreground md:text-[40px]">
              Just type what you need or browse our collection
            </h2>
          </div>

          <div className="mt-5 flex justify-center">
            <div className="flex max-w-full flex-wrap items-center justify-center gap-x-3 gap-y-2 rounded-full bg-[#0c0c0b] px-5 py-3 text-[12px] text-muted shadow-[0_18px_45px_rgba(0,0,0,0.34)] ring-1 ring-white/6 md:px-6">
              <Link
                href="/"
                className={`transition ${!tag ? "text-foreground" : "hover:text-foreground"}`}
              >
                All
              </Link>
              <span className="text-muted-soft">|</span>
              {visibleTags.map((item) => (
                <Link
                  key={item.id}
                  href={`/?tag=${encodeURIComponent(item.name)}`}
                  className={`transition ${tag === item.name ? "text-foreground" : "hover:text-foreground"}`}
                >
                  {item.name}
                </Link>
              ))}
              {allTags.length > visibleTags.length && (
                <span className="text-muted-soft">Show all</span>
              )}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1500px] px-5 pb-20 md:px-8 xl:px-14">
          <div className="rounded-[36px] border border-white/5 bg-[linear-gradient(180deg,rgba(58,54,48,0.18)_0%,rgba(31,29,26,0.34)_100%)] p-5 shadow-[0_24px_60px_rgba(0,0,0,0.16)] md:p-6 xl:p-8">
          {prompts.length === 0 ? (
            <div className="rounded-[28px] border border-border bg-surface px-6 py-14 text-center shadow-[0_16px_40px_rgba(0,0,0,0.18)]">
              <h2 className="text-[24px] font-medium text-foreground md:text-[40px]">
                No prompts found
              </h2>
              <p className="mt-4 text-[14px] text-muted">
                Try another phrase or clear the active tag filter.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {prompts.map((prompt) => (
                <PromptCard key={prompt.id} prompt={prompt} />
              ))}
            </div>
          )}
          </div>
        </section>
      </main>

      <footer className="relative z-10 mt-12 bg-[#0b0b0a] shadow-[0_-24px_60px_rgba(0,0,0,0.2)]">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-3 px-5 py-6 text-[12px] text-[#9a948b] md:px-8 xl:px-14">
          <p>Created for the mini CMS project. Public prompt library with creator dashboard.</p>
          <Link href="/dashboard/settings" className="text-[#d7d2ca] underline underline-offset-4">
            Privacy policy
          </Link>
        </div>
      </footer>

      <div className="fixed bottom-4 right-4 z-30 w-[min(92vw,28rem)] rounded-[24px] border border-border/90 bg-[#171716]/95 p-4 shadow-[0_24px_70px_rgba(0,0,0,0.4)] backdrop-blur-xl">
        <div className="flex items-end justify-between gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-full border border-border/90 bg-surface-strong/70 text-foreground">
                <FaCookieBite size={16} />
              </span>
              <p className="text-[24px] font-medium leading-none text-foreground">We use cookies!</p>
            </div>
            <p className="max-w-[24rem] text-[13px] leading-[1.5] text-muted">
              This is a visual placeholder for the consent popup. It stays non-functional for now.
            </p>
          </div>
          <button
            type="button"
            className="shrink-0 rounded-full border border-border px-4 py-2 text-[12px] text-foreground transition hover:border-foreground"
          >
            Accept
          </button>
        </div>
        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            type="button"
            className="rounded-full border border-border bg-[#f0e8e0] px-4 py-2 text-[12px] text-[#1a1a18]"
          >
            Preferences
          </button>
          <button
            type="button"
            className="flex size-9 items-center justify-center rounded-full border border-border text-foreground"
            aria-label="Cookie settings"
          >
            <FaCookieBite size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
