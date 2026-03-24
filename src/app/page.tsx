import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { FaSearch, FaStar, FaTags } from "react-icons/fa";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tag?: string }>;
}) {
  const { q, tag } = await searchParams;

  const where: any = { status: "PUBLISHED" };
  if (q) {
    where.OR = [
      { title: { contains: q } },
      { description: { contains: q, } },
      { userPrompt: { contains: q, } },
    ];
  }
  if (tag) {
    where.tags = { some: { name: tag } };
  }

  const [prompts, allTags] = await Promise.all([
    prisma.prompt.findMany({
      where,
      orderBy: { publishDate: "desc" },
      include: {
        promptType: true,
        tags: true,
        user: { select: { name: true, image: true, username: true } },
        evaluations: { select: { rating: true } },
      },
    }),
    prisma.tag.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-50 font-sans">
      {/* Navbar Placeholder */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
            PromptVault
          </Link>
          <nav className="flex space-x-4">
            <Link href="/dashboard" className="text-sm font-medium hover:text-blue-500 transition">
              Creator Dashboard
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-6 text-center max-w-4xl mx-auto space-y-6">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
          Discover the Best <br/>
          <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">AI Prompts</span>
        </h1>
        <p className="text-lg md:text-xl text-zinc-600 dark:text-zinc-400">
          Explore a curated collection of high-quality, tested AI prompts for GPT-4, Claude, Midjourney, and more.
        </p>

        {/* Search Bar */}
        <form className="max-w-2xl mx-auto pt-8 relative">
          <input 
            type="text" 
            name="q"
            defaultValue={q}
            placeholder="Search prompts by keyword, model, or task..."
            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm text-lg transition-all"
          />
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
          {tag && <input type="hidden" name="tag" value={tag} />}
        </form>

        {/* Popular Tags */}
        <div className="flex flex-wrap justify-center gap-2 pt-4">
          <span className="text-sm text-zinc-500 font-medium py-1 px-2">Popular topics:</span>
          {allTags.slice(0, 10).map(t => (
            <Link 
              key={t.id} 
              href={`/?tag=${encodeURIComponent(t.name)}`}
              className={`text-sm px-3 py-1 rounded-full border transition-colors ${
                tag === t.name 
                  ? "bg-blue-500 text-white border-blue-500" 
                  : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-blue-500 hover:text-blue-500"
              }`}
            >
              {t.name}
            </Link>
          ))}
          {tag && (
            <Link href="/" className="text-sm px-3 py-1 rounded-full text-red-500 hover:underline">
              Clear Filter
            </Link>
          )}
        </div>
      </section>

      {/* Prompts Grid */}
      <main className="max-w-7xl mx-auto px-6 pb-24">
        {prompts.length === 0 ? (
          <div className="text-center py-20 text-zinc-500">
            No prompts found matching your search. Try different keywords.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {prompts.map((p) => {
              const avgRating = p.evaluations.length 
                ? (p.evaluations.reduce((acc, curr) => acc + curr.rating, 0) / p.evaluations.length).toFixed(1)
                : "New";

              return (
                <Link key={p.id} href={`/${p.promptType.slug}/${p.user.username}/${p.slug}`} className="block group">
                  <article className="h-full bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300">
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full">
                        {p.promptType.name}
                      </span>
                      <div className="flex items-center space-x-1 text-sm font-medium text-yellow-600 dark:text-yellow-500">
                        <FaStar />
                        <span>{avgRating}</span>
                      </div>
                    </div>
                    
                    <h2 className="text-xl font-bold mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                      {p.title}
                    </h2>
                    
                    <p className="text-zinc-600 dark:text-zinc-400 text-sm line-clamp-3 mb-6 flex-1">
                      {p.description || "No description provided."}
                    </p>
                    
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-zinc-100 dark:border-zinc-800">
                      <div className="flex items-center space-x-2">
                        {p.user?.image ? (
                          <img src={p.user.image} alt={p.user.name || "User"} className="w-6 h-6 rounded-full" />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                        )}
                        <span className="text-xs font-medium text-zinc-500">{p.user?.name || "Anonymous"}</span>
                      </div>
                      <div className="flex items-center text-xs text-zinc-400 space-x-1">
                        <FaTags />
                        <span className="truncate max-w-[100px]">{p.tags.map(t => t.name).join(", ")}</span>
                      </div>
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
