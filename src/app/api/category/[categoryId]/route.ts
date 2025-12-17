import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  try {
    const { categoryId } = await params;
    if (!categoryId)
      return NextResponse.json("Category id is required!", { status: 4000 });
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });
    return NextResponse.json(category);
  } catch (error) {
    console.log("[CATEGORY_GET]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  try {
    const body = await req.json();
    const { name, image } = body;
    const { categoryId } = await params;
    if (!categoryId)
      return NextResponse.json("Category id is required!", { status: 4000 });
    if (!name) return NextResponse.json("Name is required!", { status: 400 });
    const category = await prisma.category.update({
      where: { id: categoryId },
      data: { name, image },
    });
    return NextResponse.json(category);
  } catch (error) {
    console.log("[CATEGORY_PATCH]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  try {
    const { categoryId } = await params;
    if (!categoryId) return NextResponse.json("Category Id is required!");
    const category = await prisma.category.delete({
      where: { id: categoryId },
    });
    return NextResponse.json(category);
  } catch (error) {
    console.log("[CATEGORY_DELETE]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
