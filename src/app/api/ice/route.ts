import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const ices = await prisma.ice.findMany({orderBy: { createdAt: "desc" }});
    return NextResponse.json(ices);
  } catch (error) {
    console.log("[ICE_GET]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, productId } = body;
    if (!name)
      return NextResponse.json("name is required", { status: 400 });
    if (!productId)
      return NextResponse.json("productId is required", { status: 400 });
    const currentIce = await prisma.ice.findMany({ where: { productId } });
    const existedIce = currentIce.find((ice) => ice.name === name);
    if (existedIce) {
      return NextResponse.json("Ice's already existed!", { status: 400 });
    }
    const ice = await prisma.ice.create({
      data: { name, productId },
    });
    return NextResponse.json(ice);
  } catch (error) {
    console.log("[ICE_POST]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
