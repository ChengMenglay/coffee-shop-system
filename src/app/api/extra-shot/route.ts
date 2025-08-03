import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, productId, priceModifier } = body;
    if (!name)
      return NextResponse.json("name is required", { status: 400 });
    if (!productId)
      return NextResponse.json("productId is required", { status: 400 });
    if (priceModifier === undefined)
      return NextResponse.json("priceModifier is required", { status: 400 });
    const currentExtraShot = await prisma.extraShot.findMany({ where: { productId } });
    const existedExtraShot = currentExtraShot.find((extraShot) => extraShot.name === name);
    if (existedExtraShot) {
      return NextResponse.json("Extra shot's already existed!", { status: 400 });
    }
    const extraShot = await prisma.extraShot.create({
      data: { name, productId, priceModifier },
    });
    return NextResponse.json(extraShot);
  } catch (error) {
    console.log("[EXTRA_SHOT_POST]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
