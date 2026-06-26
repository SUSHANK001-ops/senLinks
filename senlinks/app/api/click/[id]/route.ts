import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";

function getDevice(ua: string): string {
  if (/mobile/i.test(ua)) return "mobile";
  if (/tablet|ipad/i.test(ua)) return "tablet";
  return "desktop";
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  const { allowed } = rateLimit(`click:${ip}:${id}`, 5, 60_000);
  if (!allowed) {
    // Still redirect even if rate limited — just don't log
    const link = await prisma.link.findUnique({ where: { id }, select: { url: true } });
    if (link) return NextResponse.redirect(link.url);
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const link = await prisma.link.findUnique({ where: { id } });
  if (!link || !link.isActive) {
    return NextResponse.json({ error: "Link not found" }, { status: 404 });
  }

  // Schedule check
  const now = new Date();
  if (link.startsAt && now < link.startsAt) {
    return NextResponse.json({ error: "Link not yet active" }, { status: 410 });
  }
  if (link.expiresAt && now > link.expiresAt) {
    return NextResponse.json({ error: "Link has expired" }, { status: 410 });
  }

  const ua = req.headers.get("user-agent") ?? "";
  const referrer = req.headers.get("referer") ?? null;
  const country =
    req.headers.get("cf-ipcountry") ??
    req.headers.get("x-vercel-ip-country") ??
    null;

  // Log click and increment counter
  await prisma.$transaction([
    prisma.clickLog.create({
      data: {
        linkId: id,
        country,
        device: getDevice(ua),
        referrer,
      },
    }),
    prisma.link.update({
      where: { id },
      data: { clicks: { increment: 1 } },
    }),
  ]);

  return NextResponse.redirect(link.url);
}
