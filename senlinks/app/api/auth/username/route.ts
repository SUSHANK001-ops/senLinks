import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

const USERNAME_REGEX = /^[a-z0-9_]{3,20}$/;

// GET /api/auth/username?q=someusername — check availability
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.toLowerCase().trim();
  if (!q) return NextResponse.json({ available: false, error: "Missing query" }, { status: 400 });
  if (!USERNAME_REGEX.test(q))
    return NextResponse.json({ available: false, error: "3–20 chars, lowercase letters, numbers, underscores only" });

  const existing = await prisma.user.findUnique({ where: { username: q } });
  return NextResponse.json({ available: !existing });
}

// POST /api/auth/username — save the chosen username
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { username } = await req.json();
  const clean = (username as string)?.toLowerCase().trim();

  if (!clean || !USERNAME_REGEX.test(clean))
    return NextResponse.json(
      { error: "3–20 chars, lowercase letters, numbers, underscores only" },
      { status: 400 }
    );

  const taken = await prisma.user.findFirst({
    where: { username: clean, NOT: { id: session.user.id } },
  });
  if (taken)
    return NextResponse.json({ error: "Username already taken" }, { status: 409 });

  await prisma.user.update({
    where: { id: session.user.id },
    data: { username: clean },
  });

  return NextResponse.json({ success: true });
}
