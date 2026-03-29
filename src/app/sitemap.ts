import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://promptvault.example.com";
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
