import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name } = body;
    if (!name) return NextResponse.json("Name is required", { status: 400 });
    const category = await prisma.category.create({ data: { name } });
    return NextResponse.json(category);
  } catch (error) {
    console.log("[CATEGORY_POST]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
