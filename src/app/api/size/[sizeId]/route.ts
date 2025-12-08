import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ sizeId: string }> }
) {
  try {
    const { sizeId } = await params;
    if (!sizeId)
      return NextResponse.json("Size Id is required", { status: 400 });
    const size = await prisma.size.findUnique({
      where: { id: sizeId },
      include: { product: { include: {category: true} } },
    });
    return NextResponse.json(size);
  }
  catch (error) {
    console.log("[SIZE_GET]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ sizeId: string }> }
) {
  try {
    const { sizeId } = await params;
    const body = await req.json();
    const { sizeName, priceModifier, productId } = await body;
    if (!sizeId)
      return NextResponse.json("Size Id is required", { status: 400 });
    if (!sizeName)
      return NextResponse.json("sizeName is required", { status: 400 });
    if (!productId)
      return NextResponse.json("productId is required", { status: 400 });
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    const fullPrice = Number(product?.price) + Number(priceModifier);
    const size = await prisma.size.update({
      where: { id: sizeId },
      data: { sizeName, priceModifier, productId, fullPrice },
    });
    return NextResponse.json(size);
  } catch (error) {
    console.log("SIZE_PATCH", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ sizeId: string }> }
) {
  try {
    const { sizeId } = await params;
    if (!sizeId)
      return NextResponse.json("Size Id is required", { status: 400 });

    const size = await prisma.size.delete({ where: { id: sizeId } });
    return NextResponse.json(size);
  } catch (error) {
    console.log("SIZE_DELETE", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}
