import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const { title, url, icon, isActive, order, startsAt, expiresAt } = body as {
      title?: string;
      url?: string;
      icon?: string;
      isActive?: boolean;
      order?: number;
      startsAt?: string | null;
      expiresAt?: string | null;
    };

    // Ownership check
    const existing = await prisma.link.findFirst({
      where: { id, userId: session.user.id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Link not found." }, { status: 404 });
    }

    if (url) {
      try {
        new URL(url);
      } catch {
        return NextResponse.json({ error: "Invalid URL format." }, { status: 400 });
      }
    }

    const link = await prisma.link.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(url !== undefined && { url }),
        ...(icon !== undefined && { icon }),
        ...(isActive !== undefined && { isActive }),
        ...(order !== undefined && { order }),
        ...(startsAt !== undefined && {
          startsAt: startsAt ? new Date(startsAt) : null,
        }),
        ...(expiresAt !== undefined && {
          expiresAt: expiresAt ? new Date(expiresAt) : null,
        }),
      },
    });

    return NextResponse.json({ link });
  } catch (error) {
    console.error("[LINKS PUT]", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const existing = await prisma.link.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Link not found." }, { status: 404 });
  }

  await prisma.link.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
