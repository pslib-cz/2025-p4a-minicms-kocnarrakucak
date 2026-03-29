import Link from "next/link";
import { FaRegClone, FaStar, FaTags } from "react-icons/fa";

export type PromptCardItem = {
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

export function PromptCard({
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
