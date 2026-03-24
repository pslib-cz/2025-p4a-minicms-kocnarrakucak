import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { aiModelSchema } from "@/lib/validations";

export async function GET() {
  try {
    const models = await prisma.aiModel.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json(models);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch models" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const json = await req.json();
    const result = aiModelSchema.safeParse(json);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid data", details: result.error.issues },
        { status: 400 }
      );
    }

    const existing = await prisma.aiModel.findUnique({
      where: { name: result.data.name },
    });

    if (existing) {
      return NextResponse.json({ error: "Model already exists" }, { status: 409 });
    }

    const model = await prisma.aiModel.create({
      data: result.data,
    });

    return NextResponse.json(model, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create model" }, { status: 500 });
  }
}
