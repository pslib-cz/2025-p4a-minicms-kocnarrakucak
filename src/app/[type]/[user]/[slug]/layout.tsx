import { Metadata } from "next";
import { prisma } from "@/lib/prisma";

type Props = {
  params: Promise<{ type: string; user: string; slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { type, user, slug } = await params;

  const prompt = await prisma.prompt.findFirst({
    where: { slug, user: { username: user }, promptType: { slug: type } },
    include: { promptType: true, user: true },
  });

  if (!prompt || prompt.user.username !== user) {
    return {
      title: "Prompt Not Found",
    };
  }

  return {
    title: prompt.title,
    description: prompt.description || `AI Prompt for ${prompt.title}`,
    openGraph: {
      title: prompt.title,
      description: prompt.description || `AI Prompt for ${prompt.title}`,
      type: "article",
      publishedTime: prompt.publishDate?.toISOString(),
      authors: [prompt.user.username],
      url: `/${prompt.promptType.slug}/${prompt.user.username}/${prompt.slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: prompt.title,
      description: prompt.description || `AI Prompt for ${prompt.title}`,
    },
    alternates: {
      canonical: `/${prompt.promptType.slug}/${prompt.user.username}/${prompt.slug}`,
    },
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
