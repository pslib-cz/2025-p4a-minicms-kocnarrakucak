import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { canManageEvaluation } from "@/lib/evaluation-permissions";
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
    const [prompt, evaluation] = await Promise.all([
      prisma.prompt.findUnique({ where: { id: promptId } }),
      prisma.modelEvaluation.findUnique({ where: { id: evalId } }),
    ]);

    if (!prompt || !evaluation || evaluation.promptId !== promptId) {
      return NextResponse.json({ error: "Evaluation not found" }, { status: 404 });
    }

    if (
      !canManageEvaluation({
        currentUserId: session.user.id,
        currentUserRole: session.user.role,
        evaluationUserId: evaluation.userId,
        promptOwnerId: prompt.userId,
      })
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const json = await req.json();
    const result = evaluationSchema.safeParse(json);

    if (!result.success) {
      return NextResponse.json({ error: "Invalid data", details: result.error.issues }, { status: 400 });
    }

    const updatedEvaluation = await prisma.modelEvaluation.update({
      where: { id: evalId },
      data: {
        rating: result.data.rating,
        comment: result.data.comment,
        aiModelId: result.data.aiModelId,
      },
      include: {
        aiModel: true,
      },
    });

    return NextResponse.json(updatedEvaluation);
  } catch {
    return NextResponse.json({ error: "Failed to update evaluation" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; evalId: string }> }
  ) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: promptId, evalId } = await params;
    const [prompt, evaluation] = await Promise.all([
      prisma.prompt.findUnique({ where: { id: promptId } }),
      prisma.modelEvaluation.findUnique({ where: { id: evalId } }),
    ]);

    if (!prompt || !evaluation || evaluation.promptId !== promptId) {
      return NextResponse.json({ error: "Evaluation not found" }, { status: 404 });
    }

    if (
      !canManageEvaluation({
        currentUserId: session.user.id,
        currentUserRole: session.user.role,
        evaluationUserId: evaluation.userId,
        promptOwnerId: prompt.userId,
      })
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.modelEvaluation.delete({
      where: { id: evalId },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete evaluation" }, { status: 500 });
  }
}
