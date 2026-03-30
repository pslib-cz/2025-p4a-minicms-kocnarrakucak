import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { promptSchema } from "@/lib/validations";
import { validatePromptRelationSelection } from "@/lib/prompt-relations";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const prompt = await prisma.prompt.findUnique({
      where: { id },
      include: {
        tags: true,
        evaluations: {
          include: { aiModel: true },
        },
      },
    });

    if (!prompt) {
      return NextResponse.json({ error: "Prompt not found" }, { status: 404 });
    }

    if (prompt.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(prompt);
  } catch {
    return NextResponse.json({ error: "Failed to fetch prompt" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const json = await req.json();
    const result = promptSchema.safeParse(json);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid data", details: result.error.issues },
        { status: 400 }
      );
    }

    const prompt = await prisma.prompt.findUnique({ where: { id } });
    if (!prompt) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (prompt.userId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { tags, ...promptData } = result.data;
    const [promptType, existingTags] = await Promise.all([
      prisma.promptType.findUnique({
        where: { id: promptData.promptTypeId },
        select: { id: true },
      }),
      tags.length > 0
        ? prisma.tag.findMany({
            where: { id: { in: tags } },
            select: { id: true },
          })
        : Promise.resolve([]),
    ]);

    const relationValidation = validatePromptRelationSelection({
      promptTypeId: promptData.promptTypeId,
      availablePromptTypeIds: promptType ? [promptType.id] : [],
      tagIds: tags,
      availableTagIds: existingTags.map((tag) => tag.id),
    });

    if (!relationValidation.valid) {
      return NextResponse.json({ error: relationValidation.error }, { status: 400 });
    }

    const updatedPrompt = await prisma.prompt.update({
      where: { id },
      data: {
        ...promptData,
        publishDate:
          promptData.status === "PUBLISHED" && prompt.status !== "PUBLISHED"
            ? new Date()
            : prompt.publishDate,
        tags: {
          set: [], // Disconnect all previously connected tags
          connect: tags.map((tId) => ({ id: tId })),
        },
      },
    });

    return NextResponse.json(updatedPrompt);
  } catch {
    return NextResponse.json({ error: "Failed to update prompt" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    
    const prompt = await prisma.prompt.findUnique({ where: { id } });
    if (!prompt) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (prompt.userId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    await prisma.prompt.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete prompt" }, { status: 500 });
  }
}
