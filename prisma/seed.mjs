import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const user = await prisma.user.upsert({
    where: { email: "demo@example.com" },
    update: {},
    create: {
      name: "Demo User",
      email: "demo@example.com",
      image: "https://i.pravatar.cc/150?u=admin",
    },
  });

  const tagsData = ["SEO", "Marketing", "Programming", "Design", "Writing"];
  const tags = [];

  for (const tagName of tagsData) {
    const tag = await prisma.tag.upsert({
      where: { name: tagName },
      update: {},
      create: { name: tagName },
    });

    tags.push(tag);
  }

  const modelsData = [
    { name: "GPT-4o", provider: "OpenAI", description: "Flagship model" },
    { name: "Claude 3.5 Sonnet", provider: "Anthropic", description: "Great for coding" },
    { name: "Midjourney v6", provider: "Midjourney", description: "Image generation model" },
  ];

  const aiModels = [];

  for (const modelData of modelsData) {
    const model = await prisma.aiModel.upsert({
      where: { name: modelData.name },
      update: {},
      create: modelData,
    });

    aiModels.push(model);
  }

  const promptTypesData = [
    { name: "Text to text", slug: "text-to-text" },
    { name: "Text to image", slug: "text-to-image" },
    { name: "Image to image", slug: "image-to-image" },
    { name: "Text to video", slug: "text-to-video" },
    { name: "Text to audio", slug: "text-to-audio" },
    { name: "Code generation", slug: "code-generation" },
  ];

  const promptTypes = {};

  for (const promptType of promptTypesData) {
    const createdType = await prisma.promptType.upsert({
      where: { slug: promptType.slug },
      update: {},
      create: promptType,
    });

    promptTypes[promptType.slug] = createdType;
  }

  const textPromptType = promptTypes["text-to-text"];

  const prompt1 = await prisma.prompt.upsert({
    where: { userId_slug: { userId: user.id, slug: "react-component-generator" } },
    update: {},
    create: {
      title: "React Component Generator",
      promptTypeId: textPromptType.id,
      slug: "react-component-generator",
      description: "Generates a fully typed React component with Tailwind CSS.",
      systemPrompt: "You are an expert React developer. Output only the component code.",
      userPrompt: "Create a {{ componentName }} component that does {{ featureDescription }}.",
      status: "PUBLISHED",
      publishDate: new Date(),
      userId: user.id,
      tags: {
        connect: [{ id: tags[2].id }],
      },
    },
  });

  await prisma.prompt.upsert({
    where: { userId_slug: { userId: user.id, slug: "blog-post-outline" } },
    update: {},
    create: {
      title: "Blog Post Outline",
      promptTypeId: textPromptType.id,
      slug: "blog-post-outline",
      description: "Creates an SEO-optimized outline for a blog post.",
      systemPrompt: "You are an SEO expert and content marketer.",
      userPrompt:
        "Create an outline for a blog post about {{ topic }} targeting the keyword '{{ keyword }}'. Include H2 and H3 headings.",
      status: "PUBLISHED",
      publishDate: new Date(),
      userId: user.id,
      tags: {
        connect: [{ id: tags[0].id }, { id: tags[1].id }],
      },
    },
  });

  await prisma.modelEvaluation.upsert({
    where: {
      userId_promptId_aiModelId: {
        userId: user.id,
        promptId: prompt1.id,
        aiModelId: aiModels[1].id,
      },
    },
    update: {},
    create: {
      rating: 5,
      comment: "Claude is exceptionally good at following the strict output constraint.",
      promptId: prompt1.id,
      aiModelId: aiModels[1].id,
      userId: user.id,
    },
  });

  console.log("Database seeded successfully!");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
