import { prisma } from "@/lib/prisma";
import { getUploadDir } from "@/lib/uploadConfig";
import { existsSync } from "fs";
import { unlink } from "fs/promises";
import { NextResponse } from "next/server";
import path from "path";

export async function PATCH(
  req: Request,
  { params }: { params: { productId: string } }
) {
  try {
    const { productId } = await params;
    const body = await req.json();
    const { name, description, status, price, categoryId, image, discount } =
      await body;
    if (!productId)
      return NextResponse.json("Product Id is required", { status: 400 });
    if (!name) return NextResponse.json("Name is required", { status: 400 });
    if (!description)
      return NextResponse.json("Description is required", { status: 400 });
    if (!status)
      return NextResponse.json("Status is required", { status: 400 });
    if (!price) return NextResponse.json("price is required", { status: 400 });
    if (!categoryId)
      return NextResponse.json("Category id is required", { status: 400 });
    if (!image) return NextResponse.json("image is required", { status: 400 });
    const product = await prisma.product.update({
      where: { id: productId },
      data: { name, description, image, status, categoryId, price, discount },
    });
    return NextResponse.json(product);
  } catch (error) {
    console.log("PRODUCT_PATCH", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { productId: string } }
) {
  try {
    const { productId } = await params;
    if (!productId)
      return NextResponse.json("Product Id is required", { status: 400 });

    const product = await prisma.product.delete({ where: { id: productId } });
    //Remove image from file directory
    const uploadDir = getUploadDir();
    const filePath = path.join(uploadDir, product.image);
    try {
      if (existsSync(filePath)) {
        await unlink(filePath);
      }
    } catch (err) {
      console.warn("Failed to delete image file:", err);
    }
    return NextResponse.json(product);
  } catch (error) {
    console.log("PRODUCT_DELETE", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}
