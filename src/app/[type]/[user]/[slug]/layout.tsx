import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';

type Props = {
  params: Promise<{ type: string; user: string; slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { type, user, slug } = await params;

  const prompt = await prisma.prompt.findFirst({
    where: { slug, user: { username: user } },
    include: { promptType: true, user: true },
  });

  if (!prompt || prompt.user.username !== user) {
    return {
      title: 'Prompt Not Found',
    };
  }

  return {
    title: `${prompt.title} - PromptVault`,
    description: prompt.description || `AI Prompt for ${prompt.title}`,
    openGraph: {
      title: `${prompt.title} - PromptVault`,
      description: prompt.description || `AI Prompt for ${prompt.title}`,
      type: 'article',
      publishedTime: prompt.publishDate?.toISOString(),
      authors: [prompt.user.username],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${prompt.title} - PromptVault`,
      description: prompt.description || `AI Prompt for ${prompt.title}`,
    },
    alternates: {
      canonical: `https://promptvault.example.com/${prompt.promptType.slug}/${prompt.user.username}/${prompt.slug}`,
    },
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
