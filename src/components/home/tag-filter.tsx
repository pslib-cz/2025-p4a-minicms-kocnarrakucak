"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

type TagItem = {
  id: string;
  name: string;
};

type HomeTagFilterProps = {
  tags: TagItem[];
  activeTag?: string;
  searchQuery?: string;
};

function buildHomeHref({ searchQuery, tag }: { searchQuery?: string; tag?: string }) {
  const params = new URLSearchParams();

  if (searchQuery) {
    params.set("q", searchQuery);
  }

  if (tag) {
    params.set("tag", tag);
  }

  const query = params.toString();
  return query ? `/?${query}` : "/";
}

export function HomeTagFilter({ tags, activeTag, searchQuery }: HomeTagFilterProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSelect = (nextTag?: string) => {
    const href = buildHomeHref({ searchQuery, tag: nextTag });

    startTransition(() => {
      router.replace(href, { scroll: false });
    });
  };

  return (
    <div className="flex max-w-full flex-wrap items-center justify-center gap-x-3 gap-y-2 rounded-full border border-border bg-surface px-5 py-3 text-[12px] text-muted shadow-[0_18px_45px_rgba(0,0,0,0.18)] md:px-6">
      <button
        type="button"
        onClick={() => handleSelect()}
        disabled={isPending && !activeTag}
        className={`transition ${!activeTag ? "text-foreground" : "hover:text-foreground"}`}
      >
        All
      </button>
      <span className="text-muted-soft">|</span>
      {tags.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => handleSelect(item.name)}
          disabled={isPending && activeTag === item.name}
          className={`transition ${
            activeTag === item.name ? "text-foreground" : "hover:text-foreground"
          }`}
        >
          {item.name}
        </button>
      ))}
    </div>
  );
}
