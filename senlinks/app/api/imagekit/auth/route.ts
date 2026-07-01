import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createHmac, randomUUID } from "crypto";

/**
 * GET /api/imagekit/auth
 * Returns a signed upload token for direct browser-to-ImageKit uploads.
 * IMAGEKIT_PRIVATE_KEY is NEVER returned — only the signature derived from it.
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const privateKey = process.env.NEXT_IMAGEKIT_PRIVATE;
  if (!privateKey) {
    console.error("[ImageKit Auth] NEXT_IMAGEKIT_PRIVATE is not set");
    return NextResponse.json(
      { error: "Server configuration error." },
      { status: 500 }
    );
  }

  const token = randomUUID();
  const expire = Math.floor(Date.now() / 1000) + 2400; // 40 minutes from now
  const signature = createHmac("sha1", privateKey)
    .update(token + expire)
    .digest("hex");

  return NextResponse.json({
    token,
    expire,
    signature,
    publicKey: process.env.NEXT_IMAGEKIT_PUBLIC,
  });
}
