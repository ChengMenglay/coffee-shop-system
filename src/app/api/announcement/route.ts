import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const announcement = await prisma.announcement.findMany({orderBy: { createdAt: "desc" }});
    return NextResponse.json(announcement);
  } catch (error) {
    console.log("[ANNOUNCEMENT_GET]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {type, title, content, image, isActive } = body;
    if (!title) return NextResponse.json("title is required", { status: 400 });
    if (!content) return NextResponse.json("content is required", { status: 400 });

    const announcement = await prisma.announcement.create({
      data: {type, title, content, image, isActive },
    });
    return NextResponse.json(announcement);
  } catch (error) {
    console.log("[ANNOUNCEMENT_POST]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
