import { Prisma } from "@prisma/client";
import Link from "next/link";
import { FaArrowRight, FaRegUser, FaSearch } from "react-icons/fa";
import { PaginationRail } from "@/components/home/pagination-rail";
import { PromptCard, type PromptCardItem } from "@/components/home/prompt-card";
import { ThemeSwitch } from "@/components/theme-switch";
import { prisma } from "@/lib/prisma";

const PUBLIC_PAGE_SIZE = 6;

function readSingleSearchParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function parsePageParam(value?: string) {
  const parsed = Number.parseInt(value || "1", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}


export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[]; tag?: string | string[]; page?: string | string[] }>;
}) {
  const resolvedSearchParams = await searchParams;
  const q = readSingleSearchParam(resolvedSearchParams.q)?.trim();
  const tag = readSingleSearchParam(resolvedSearchParams.tag)?.trim();
  const requestedPage = parsePageParam(readSingleSearchParam(resolvedSearchParams.page));

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
  let totalMatchingPrompts = 0;
  let pageCount = 1;
  let currentPage = requestedPage;

  try {
    totalMatchingPrompts = await prisma.prompt.count({ where });

    pageCount = Math.max(1, Math.ceil(totalMatchingPrompts / PUBLIC_PAGE_SIZE));
    currentPage = Math.min(requestedPage, pageCount);

    [prompts, allTags] = await Promise.all([
      prisma.prompt.findMany({
        where,
        orderBy: { publishDate: "desc" },
        skip: (currentPage - 1) * PUBLIC_PAGE_SIZE,
        take: PUBLIC_PAGE_SIZE,
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

  const visibleTags = allTags.slice(0, 8);

  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-background text-foreground">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 16% 12%, rgba(255,255,255,0.08), transparent 18%), radial-gradient(circle at 78% 12%, rgba(255,255,255,0.05), transparent 14%), linear-gradient(180deg, var(--background) 0%, color-mix(in srgb, var(--surface) 94%, transparent) 18%, color-mix(in srgb, var(--surface-strong) 90%, transparent) 38%, color-mix(in srgb, var(--panel) 70%, var(--background) 30%) 56%, color-mix(in srgb, var(--panel-strong) 68%, var(--background) 32%) 70%, color-mix(in srgb, var(--surface-strong) 78%, var(--background) 22%) 86%, color-mix(in srgb, var(--surface) 84%, var(--background) 16%) 100%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-[20rem] h-[30rem] [clip-path:polygon(0_78%,35%_100%,100%_58%,100%_100%,0_100%)] blur-2xl"
        style={{
          background:
            "linear-gradient(135deg, color-mix(in srgb, var(--panel) 10%, transparent) 0%, color-mix(in srgb, var(--panel-strong) 44%, transparent) 48%, color-mix(in srgb, var(--panel-strong) 56%, transparent) 100%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-[30rem] h-[52rem]"
        style={{
          background:
            "linear-gradient(180deg, color-mix(in srgb, var(--panel) 0%, transparent) 0%, color-mix(in srgb, var(--panel) 12%, transparent) 18%, color-mix(in srgb, var(--panel-strong) 28%, transparent) 46%, color-mix(in srgb, var(--surface-strong) 54%, var(--background) 46%) 76%, color-mix(in srgb, var(--surface) 76%, var(--background) 24%) 100%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-[-8rem] h-[30rem]"
        style={{
          background:
            "radial-gradient(circle at 50% 0%, color-mix(in srgb, var(--panel-strong) 14%, transparent), transparent 42%), linear-gradient(180deg, color-mix(in srgb, var(--surface) 0%, transparent) 0%, color-mix(in srgb, var(--surface) 54%, transparent) 62%, color-mix(in srgb, var(--surface) 82%, var(--background) 18%) 100%)",
        }}
      />

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
                className="inline-flex items-center gap-3 rounded-full border border-border bg-surface px-5 py-3 text-[14px] text-foreground shadow-[0_18px_45px_rgba(0,0,0,0.18)] transition hover:bg-surface-strong"
                aria-label="Account"
              >
                <span>Account</span>
                <span className="flex size-8 items-center justify-center rounded-full border border-border bg-surface-strong">
                  <FaRegUser size={13} />
                </span>
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1200px] px-5 pb-10 md:px-8">
          {isDataUnavailable && (
            <div className="mx-auto mb-6 max-w-[720px] rounded-[20px] border border-border bg-surface px-4 py-3 text-center text-[13px] text-muted shadow-[0_18px_40px_rgba(0,0,0,0.2)]">
              Demo mode: public data is unavailable locally. Configure `DATABASE_URL`, auth secret and OAuth env
              vars to load real prompts.
            </div>
          )}

          <form
            className="mx-auto flex max-w-[560px] items-center gap-3 rounded-full border border-border bg-surface px-4 py-3 shadow-[0_22px_55px_rgba(0,0,0,0.18)]"
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
              className="flex size-9 items-center justify-center rounded-full border border-border bg-surface-strong text-foreground transition hover:bg-panel"
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
            <div className="flex max-w-full flex-wrap items-center justify-center gap-x-3 gap-y-2 rounded-full border border-border bg-surface px-5 py-3 text-[12px] text-muted shadow-[0_18px_45px_rgba(0,0,0,0.18)] md:px-6">
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
          <div className="rounded-[36px] border border-border/70 bg-[rgba(255,255,255,0.03)] p-5 shadow-[0_24px_60px_rgba(0,0,0,0.14)] md:p-6 xl:p-8">
            {totalMatchingPrompts === 0 ? (
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

            <PaginationRail currentPage={currentPage} pageCount={pageCount} q={q} tag={tag} />
          </div>
        </section>
      </main>

      <footer className="relative z-10 mt-12 border-t border-border/70 bg-surface shadow-[0_-24px_60px_rgba(0,0,0,0.12)]">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-3 px-5 py-6 text-[12px] text-muted md:px-8 xl:px-14">
          <p>Created for the mini CMS project. Public prompt library with creator dashboard.</p>
          <div className="flex items-center gap-3">
            <ThemeSwitch />
            <Link href="/dashboard/settings" className="text-foreground underline underline-offset-4">
              Privacy policy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
