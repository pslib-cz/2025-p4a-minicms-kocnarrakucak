import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { evaluationSchema } from "@/lib/validations";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; evalId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: promptId, evalId } = await params;
    
    const prompt = await prisma.prompt.findUnique({ where: { id: promptId } });
    if (!prompt) return NextResponse.json({ error: "Prompt not found" }, { status: 404 });
    if (prompt.userId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const json = await req.json();
    const result = evaluationSchema.safeParse(json);

    if (!result.success) {
      return NextResponse.json({ error: "Invalid data", details: result.error.issues }, { status: 400 });
    }

    const evaluation = await prisma.modelEvaluation.update({
      where: { id: evalId },
      data: {
        rating: result.data.rating,
        comment: result.data.comment,
        outputImageUrl: result.data.outputImageUrl,
        outputText: result.data.outputText,
        aiModelId: result.data.aiModelId,
      },
      include: {
        aiModel: true,
      },
    });

    return NextResponse.json(evaluation);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update evaluation" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; evalId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: promptId, evalId } = await params;
    
    const prompt = await prisma.prompt.findUnique({ where: { id: promptId } });
    if (!prompt) return NextResponse.json({ error: "Prompt not found" }, { status: 404 });
    if (prompt.userId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    await prisma.modelEvaluation.delete({
      where: { id: evalId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete evaluation" }, { status: 500 });
  }
}
