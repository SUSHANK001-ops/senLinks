import { NextResponse } from "next/server";

// Part 2 stub — display section API
export async function GET() {
  return NextResponse.json({
    message: "Display section API — coming in Part 2.",
    modes: ["default", "photo", "canvas"],
  });
}

export async function POST() {
  return NextResponse.json(
    { message: "Display section management coming in Part 2." },
    { status: 501 }
  );
}
