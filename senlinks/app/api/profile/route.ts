import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const IMAGEKIT_HOST = "ik.imagekit.io";

function isImageKitUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return (
      parsed.hostname === IMAGEKIT_HOST ||
      parsed.hostname.endsWith(`.${IMAGEKIT_HOST}`)
    );
  } catch {
    return false;
  }
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      bio: true,
      avatarUrl: true,
      oauthAvatarUrl: true,
      username: true,
      email: true,
    },
  });
  return NextResponse.json({ user });
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, bio, avatarUrl, username } = body as Record<
    string,
    string | undefined
  >;

  // Validate username if provided
  if (username !== undefined) {
    if (!/^[a-z0-9_]{3,20}$/.test(username)) {
      return NextResponse.json(
        {
          error:
            "Username must be 3–20 chars: lowercase letters, numbers, underscores only.",
        },
        { status: 400 }
      );
    }
    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing && existing.id !== session.user.id) {
      return NextResponse.json(
        { error: "Username already taken." },
        { status: 409 }
      );
    }
  }

  // avatarUrl: only accept ImageKit CDN URLs or the user's own oauthAvatarUrl
  let safeAvatarUrl: string | null | undefined = undefined;
  if (avatarUrl !== undefined) {
    if (avatarUrl === "") {
      safeAvatarUrl = null; // allow clearing
    } else if (isImageKitUrl(avatarUrl)) {
      safeAvatarUrl = avatarUrl;
    } else {
      // Check if it matches their oauthAvatarUrl (import from provider)
      const dbUser = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { oauthAvatarUrl: true },
      });
      if (dbUser?.oauthAvatarUrl && avatarUrl === dbUser.oauthAvatarUrl) {
        safeAvatarUrl = avatarUrl;
      } else {
        return NextResponse.json(
          {
            error:
              "Avatar URL must be an ImageKit CDN URL. Please use the upload button.",
          },
          { status: 400 }
        );
      }
    }
  }

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      ...(name !== undefined && { name: name.trim() || null }),
      ...(bio !== undefined && { bio: bio.trim() || null }),
      ...(safeAvatarUrl !== undefined && { avatarUrl: safeAvatarUrl }),
      ...(username !== undefined && { username, usernameSet: true }),
    },
    select: {
      id: true,
      name: true,
      bio: true,
      avatarUrl: true,
      oauthAvatarUrl: true,
      username: true,
      email: true,
    },
  });

  return NextResponse.json({ user: updated });
}
