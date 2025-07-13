import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, key } = body;
    if (!name) return NextResponse.json("Name is required", { status: 400 });
    if (!key) return NextResponse.json("Key is required", { status: 400 });
    const permission = await prisma.permission.create({
      data: { name, key },
    });
    return NextResponse.json(permission)
  } catch (error) {
    console.log("[PERMISSION_POST]", error);
    return new NextResponse("Internal Server Error", {status:500})
  }
}
