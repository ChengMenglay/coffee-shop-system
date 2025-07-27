import { prisma } from "@/lib/prisma";
import { getUploadDir } from "@/lib/uploadConfig";
import { existsSync } from "fs";
import { unlink } from "fs/promises";
import { NextResponse } from "next/server";
import path from "path";

export async function PATCH(
  req: Request,
  { params }: { params: { sizeId: string } }
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
    const currentSizes = await prisma.size.findMany({ where: { productId } });
    const existedSize = currentSizes.find((size) => size.sizeName === sizeName);
    if (existedSize) {
      return NextResponse.json("Size's already exsited!", { status: 400 });
    }
    const fullPrice = product?.price + priceModifier;
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
  { params }: { params: { sizeId: string } }
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
