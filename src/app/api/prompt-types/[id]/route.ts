import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const promptsUsingType = await prisma.prompt.count({ where: { promptTypeId: id } });
    if (promptsUsingType > 0) {
      return NextResponse.json(
        { error: `Cannot delete: ${promptsUsingType} prompt(s) use this type.` },
        { status: 409 }
      );
    }

    await prisma.promptType.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete prompt type" }, { status: 500 });
  }
}
