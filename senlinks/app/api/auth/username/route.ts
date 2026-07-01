import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

const USERNAME_REGEX = /^[a-z0-9_]{3,20}$/;
const IMAGEKIT_HOST = "ik.imagekit.io";

// GET /api/auth/username?q=someusername — check availability
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.toLowerCase().trim();
  if (!q)
    return NextResponse.json(
      { available: false, error: "Missing query" },
      { status: 400 }
    );
  if (!USERNAME_REGEX.test(q))
    return NextResponse.json({
      available: false,
      error: "3–20 chars, lowercase letters, numbers, underscores only",
    });

  const existing = await prisma.user.findUnique({ where: { username: q } });
  return NextResponse.json({ available: !existing });
}

// POST /api/auth/username — save chosen username (and optional avatar) during onboarding
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { username, avatarUrl } = body as {
    username: string;
    avatarUrl?: string;
  };
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
    return NextResponse.json(
      { error: "Username already taken" },
      { status: 409 }
    );

  // Validate avatarUrl — only accept ImageKit CDN URLs or null
  let safeAvatarUrl: string | undefined = undefined;
  if (avatarUrl) {
    try {
      const parsed = new URL(avatarUrl);
      if (parsed.hostname === IMAGEKIT_HOST || parsed.hostname.endsWith(`.${IMAGEKIT_HOST}`)) {
        safeAvatarUrl = avatarUrl;
      }
    } catch {
      // ignore invalid URLs
    }
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      username: clean,
      usernameSet: true,
      ...(safeAvatarUrl !== undefined && { avatarUrl: safeAvatarUrl }),
    },
  });

  return NextResponse.json({ success: true });
}
