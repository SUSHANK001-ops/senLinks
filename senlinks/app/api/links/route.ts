import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const links = await prisma.link.findMany({
    where: { userId: session.user.id },
    orderBy: { order: "asc" },
  });

  return NextResponse.json({ links });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { title, url, icon, startsAt, expiresAt } = body as {
      title: string;
      url: string;
      icon?: string;
      startsAt?: string;
      expiresAt?: string;
    };

    if (!title || !url) {
      return NextResponse.json(
        { error: "Title and URL are required." },
        { status: 400 }
      );
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      return NextResponse.json({ error: "Invalid URL format." }, { status: 400 });
    }

    // Get highest order
    const maxOrder = await prisma.link.aggregate({
      where: { userId: session.user.id },
      _max: { order: true },
    });

    const link = await prisma.link.create({
      data: {
        title,
        url,
        icon: icon ?? null,
        startsAt: startsAt ? new Date(startsAt) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        order: (maxOrder._max.order ?? -1) + 1,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ link }, { status: 201 });
  } catch (error) {
    console.error("[LINKS POST]", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
