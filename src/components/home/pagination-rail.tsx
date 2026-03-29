import Link from "next/link";

function buildHomeHref({
  q,
  tag,
  page,
}: {
  q?: string;
  tag?: string;
  page: number;
}) {
  const params = new URLSearchParams();

  if (q) {
    params.set("q", q);
  }

  if (tag) {
    params.set("tag", tag);
  }

  if (page > 1) {
    params.set("page", String(page));
  }

  const query = params.toString();
  return query ? `/?${query}` : "/";
}

export function PaginationRail({
  currentPage,
  pageCount,
  q,
  tag,
}: {
  currentPage: number;
  pageCount: number;
  q?: string;
  tag?: string;
}) {
  if (pageCount <= 1) {
    return null;
  }

  const visiblePages = Array.from(
    { length: pageCount },
    (_, index) => index + 1
  ).filter((page) => Math.abs(page - currentPage) <= 1 || page === 1 || page === pageCount);

  return (
    <div className="mt-8 flex flex-col gap-3 border-t border-border/80 pt-5 text-[13px] text-muted md:flex-row md:items-center md:justify-between">
      <p>
        Page {currentPage} of {pageCount}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href={buildHomeHref({ q, tag, page: Math.max(1, currentPage - 1) })}
          aria-disabled={currentPage <= 1}
          className={`rounded-full border px-4 py-2 transition ${
            currentPage <= 1
              ? "pointer-events-none border-border/60 text-muted/50"
              : "border-border bg-surface hover:text-foreground"
          }`}
        >
          Previous
        </Link>
        {visiblePages.map((page, index) => (
          <div key={page} className="flex items-center gap-2">
            {index > 0 && visiblePages[index - 1] !== page - 1 && (
              <span className="px-1 text-muted-soft">...</span>
            )}
            <Link
              href={buildHomeHref({ q, tag, page })}
              className={`rounded-full border px-4 py-2 transition ${
                page === currentPage
                  ? "border-border bg-surface-strong text-foreground"
                  : "border-border bg-surface text-muted hover:text-foreground"
              }`}
            >
              {page}
            </Link>
          </div>
        ))}
        <Link
          href={buildHomeHref({ q, tag, page: Math.min(pageCount, currentPage + 1) })}
          aria-disabled={currentPage >= pageCount}
          className={`rounded-full border px-4 py-2 transition ${
            currentPage >= pageCount
              ? "pointer-events-none border-border/60 text-muted/50"
              : "border-border bg-surface hover:text-foreground"
          }`}
        >
          Next
        </Link>
      </div>
    </div>
  );
}
