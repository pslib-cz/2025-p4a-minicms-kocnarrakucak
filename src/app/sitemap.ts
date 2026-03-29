import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { getSiteUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteUrl();
  const rootEntry: MetadataRoute.Sitemap[number] = {
    url: baseUrl,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 1,
  };

  if (!process.env.DATABASE_URL) {
    return [rootEntry];
  }

  try {
    const prompts = await prisma.prompt.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, updatedAt: true, promptType: true, user: { select: { username: true } } },
    });

    const promptEntries = prompts.map((prompt) => ({
      url: `${baseUrl}/${prompt.promptType.slug}/${prompt.user.username}/${prompt.slug}`,
      lastModified: prompt.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    return [rootEntry, ...promptEntries];
  } catch {
    return [rootEntry];
  }
}
