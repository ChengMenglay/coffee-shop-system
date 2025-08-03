import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, productId } = body;
    if (!name)
      return NextResponse.json("name is required", { status: 400 });
    if (!productId)
      return NextResponse.json("productId is required", { status: 400 });
    const currentSugar = await prisma.sugar.findMany({ where: { productId } });
    const existedSugar = currentSugar.find((sugar) => sugar.name === name);
    if (existedSugar) {
      return NextResponse.json("Sugar's already existed!", { status: 400 });
    }
    const sugar = await prisma.sugar.create({
      data: { name, productId },
    });
    return NextResponse.json(sugar);
  } catch (error) {
    console.log("[SUGAR_POST]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
