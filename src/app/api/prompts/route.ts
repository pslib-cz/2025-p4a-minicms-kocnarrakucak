import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { promptSchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const search = url.searchParams.get("search") || "";
    const promptTypeId = url.searchParams.get("promptTypeId");
    const status = url.searchParams.get("status");

    const where: any = { userId: session.user.id };
    if (search) where.title = { contains: search };
    if (promptTypeId) where.promptTypeId = promptTypeId;
    if (status) where.status = status;

    const prompts = await prisma.prompt.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      include: {
        promptType: true,
        tags: true,
        user: { select: { username: true } },
      },
    });

    return NextResponse.json(prompts);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch prompts" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const json = await req.json();
    const result = promptSchema.safeParse(json);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid data 1", details: result.error.issues },
        { status: 400 }
      );
    }

    const existingSlug = await prisma.prompt.findUnique({
      where: { userId_slug: { userId: session.user.id, slug: result.data.slug } },
    });

    if (existingSlug) {
      return NextResponse.json(
        { error: "Slug already exists. Please choose a different title or slug." },
        { status: 409 }
      );
    }

    const { tags, ...promptData } = result.data;

    const newPrompt = await prisma.prompt.create({
      data: {
        ...promptData,
        status: promptData.status as any,
        userId: session.user.id,
        publishDate: promptData.status === "PUBLISHED" ? new Date() : null,
        tags: {
          connect: tags.map((id) => ({ id })),
        },
      },
    });

    return NextResponse.json(newPrompt, { status: 201 });
  } catch (error) {
    console.error("Failed to create prompt:", error);
    return NextResponse.json({ error: "Failed to create prompt" }, { status: 500 });
  }
}
