import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ billboardId: string }> }
) {
  try {
    const { billboardId } = await params;
    if (!billboardId)
      return NextResponse.json("Billboard Id is required", { status: 400 });
    const billboard = await prisma.billboard.findUnique({
      where: { id: billboardId },
    });
    return NextResponse.json(billboard);
  } catch (error) {
    console.log("[BILLBOARD_GET]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ billboardId: string }> }
) {
  try {
    const body = await req.json();
    const { title, image, link, isActive } = body;
    const { billboardId } = await params;
    if (!billboardId)
      return NextResponse.json("Category id is required!", { status: 4000 });
    if (!image) return NextResponse.json("Image is required!", { status: 400 });
    if (!title) return NextResponse.json("Title is required!", { status: 400 });
    const billboard = await prisma.billboard.update({
      where: { id: billboardId },
      data: { title, image, link, isActive },
    });
    return NextResponse.json(billboard);
  } catch (error) {
    console.log("[BILLBOARD_PATCH]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ billboardId: string }> }
) {
  try {
    const { billboardId } = await params;
    if (!billboardId) return NextResponse.json("Billboard Id is required!");
    const billboard = await prisma.billboard.delete({
      where: { id: billboardId },
    });
    return NextResponse.json(billboard);
  } catch (error) {
    console.log("[BILLBOARD_DELETE]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
