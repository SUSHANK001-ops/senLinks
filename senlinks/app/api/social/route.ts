import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const icons = await prisma.socialIcon.findMany({
    where: { userId: session.user.id },
    orderBy: { platform: "asc" },
  });

  return NextResponse.json({ icons });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { platform, url } = await req.json() as { platform: string; url: string };

    if (!platform || !url) {
      return NextResponse.json({ error: "Platform and URL are required." }, { status: 400 });
    }

    try {
      new URL(url);
    } catch {
      return NextResponse.json({ error: "Invalid URL format." }, { status: 400 });
    }

    const icon = await prisma.socialIcon.create({
      data: { platform, url, userId: session.user.id },
    });

    return NextResponse.json({ icon }, { status: 201 });
  } catch (error) {
    console.error("[SOCIAL POST]", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
