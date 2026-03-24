import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { promptSchema } from "@/lib/validations";

export async function GET(
  req: NextRequest,
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
  } catch (error) {
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

    const updatedPrompt = await prisma.prompt.update({
      where: { id },
      data: {
        ...promptData,
        status: promptData.status as any,
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
  } catch (error) {
    return NextResponse.json({ error: "Failed to update prompt" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
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
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete prompt" }, { status: 500 });
  }
}
