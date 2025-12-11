import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const billboards = await prisma.billboard.findMany({orderBy: { createdAt: "desc" }});
    return NextResponse.json(billboards);
  } catch (error) {
    console.log("[BILLBOARD_GET]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {title, image, link, isActive } = body;
    if (!image) return NextResponse.json("image is required", { status: 400 });

    const billboard = await prisma.billboard.create({
      data: { title, image, link, isActive },
    });
    return NextResponse.json(billboard);
  } catch (error) {
    console.log("[BILLBOARD_POST]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
