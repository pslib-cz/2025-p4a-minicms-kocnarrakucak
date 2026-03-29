import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { evaluationSchema } from "@/lib/validations";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: promptId } = await params;

    const prompt = await prisma.prompt.findUnique({ where: { id: promptId } });
    if (!prompt) return NextResponse.json({ error: "Prompt not found" }, { status: 404 });

    const json = await req.json();
    const result = evaluationSchema.safeParse(json);

    if (!result.success) {
      return NextResponse.json({ error: "Invalid data", details: result.error.issues }, { status: 400 });
    }

    const existing = await prisma.modelEvaluation.findUnique({
      where: {
        userId_promptId_aiModelId: {
          userId: session.user.id,
          promptId,
          aiModelId: result.data.aiModelId,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ error: "Evaluation for this model already exists" }, { status: 409 });
    }

    const evalData = await prisma.modelEvaluation.create({
      data: {
        ...result.data,
        promptId,
        userId: session.user.id,
      },
      include: {
        aiModel: true,
      },
    });

    return NextResponse.json(evalData, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create evaluation" }, { status: 500 });
  }
}
