import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sizeName, priceModifier, productId } = body;
    if (!sizeName)
      return NextResponse.json("sizeName is required", { status: 400 });
    if (!productId)
      return NextResponse.json("productId is required", { status: 400 });
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    const currentSizes = await prisma.size.findMany({ where: { productId } });
    const existedSize = currentSizes.find((size) => size.sizeName === sizeName);
    if (existedSize) {
      return NextResponse.json("Size's already exsited!", { status: 400 });
    }
    const fullPrice = Number(product?.price) + Number(priceModifier);
    const size = await prisma.size.create({
      data: { sizeName, priceModifier, productId, fullPrice },
    });
    return NextResponse.json(size);
  } catch (error) {
    console.log("[SIZE_POST]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
