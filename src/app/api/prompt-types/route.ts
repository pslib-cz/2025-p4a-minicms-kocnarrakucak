import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const promptTypeSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
});

export async function GET() {
  try {
    const types = await prisma.promptType.findMany({ orderBy: { name: "asc" } });
    return NextResponse.json(types);
  } catch {
    return NextResponse.json({ error: "Failed to fetch prompt types" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const json = await req.json();
    const result = promptTypeSchema.safeParse(json);
    if (!result.success) {
      return NextResponse.json({ error: "Invalid data", details: result.error.issues }, { status: 400 });
    }

    const existing = await prisma.promptType.findUnique({ where: { slug: result.data.slug } });
    if (existing) {
      return NextResponse.json({ error: "A type with this slug already exists" }, { status: 409 });
    }

    const type = await prisma.promptType.create({ data: result.data });
    return NextResponse.json(type, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create prompt type" }, { status: 500 });
  }
}
