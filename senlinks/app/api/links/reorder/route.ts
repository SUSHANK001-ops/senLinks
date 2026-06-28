import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { order } = body as { order: { id: string; order: number }[] };

    if (!Array.isArray(order)) {
      return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
    }

    // Batch update — verify ownership by scoping to userId
    await prisma.$transaction(
      order.map(({ id, order: o }) =>
        prisma.link.updateMany({
          where: { id, userId: session.user.id },
          data: { order: o },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[REORDER]", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
