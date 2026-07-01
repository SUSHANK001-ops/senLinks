import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createId } from "@paralleldrive/cuid2";
import bcrypt from "bcryptjs";

/**
 * POST /api/auth/register
 * Future email/password registration endpoint.
 * Sets usernameSet: true and oauthAvatarUrl: null at creation.
 */
export async function POST(req: Request) {
  try {
    const { email, password, name } = (await req.json()) as {
      email?: string;
      password?: string;
      name?: string;
    };

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    // Generate unique username from name or email prefix
    const base =
      name
        ?.toLowerCase()
        .replace(/[^a-z0-9]/g, "")
        .slice(0, 15) ||
      email
        .split("@")[0]
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "")
        .slice(0, 15) ||
      "user";
    const username = `${base}_${createId().slice(0, 6)}`;

    const hashed = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashed,
        name: name?.trim() || null,
        username,
        usernameSet: true,
        oauthAvatarUrl: null,
      },
      select: { id: true, email: true, username: true },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (err) {
    console.error("[REGISTER POST]", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
