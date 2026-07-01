import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const VALID_DISPLAY_STYLES = ["icon", "button"] as const;

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const icons = await prisma.socialIcon.findMany({
    where: { userId: session.user.id },
    orderBy: [{ order: "asc" }, { platform: "asc" }],
  });

  return NextResponse.json({ icons });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await req.json()) as {
      platform: string;
      url: string;
      displayStyle?: string;
      order?: number;
    };
    const { platform, url, displayStyle = "icon", order = 0 } = body;

    if (!platform || !url) {
      return NextResponse.json(
        { error: "Platform and URL are required." },
        { status: 400 }
      );
    }

    // Validate displayStyle
    if (!VALID_DISPLAY_STYLES.includes(displayStyle as "icon" | "button")) {
      return NextResponse.json(
        { error: "displayStyle must be 'icon' or 'button'." },
        { status: 400 }
      );
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: "Invalid URL format." },
        { status: 400 }
      );
    }

    const icon = await prisma.socialIcon.create({
      data: {
        platform,
        url,
        displayStyle,
        order,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ icon }, { status: 201 });
  } catch (error) {
    console.error("[SOCIAL POST]", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
