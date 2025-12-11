import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: { category: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(products);
  } catch (error) {
    console.log("[PRODUCT_GET]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, description, status, price, categoryId, image, discount } =
      await body;
    if (!name) return NextResponse.json("Name is required", { status: 400 });
    if (!description)
      return NextResponse.json("Description is required", { status: 400 });
    if (!status)
      return NextResponse.json("Status is required", { status: 400 });
    if (!price) return NextResponse.json("price is required", { status: 400 });
    if (!categoryId)
      return NextResponse.json("Category id is required", { status: 400 });
    if (!image) return NextResponse.json("image is required", { status: 400 });
    const product = await prisma.product.create({
      data: { name, image, price, description, status, categoryId, discount },
    });
    return NextResponse.json(product);
  } catch (error) {
    console.log("[PRODUCT_POST]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
