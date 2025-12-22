import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ extraShotId: string }> }
) {
  try {
    const { extraShotId } = await params;
    if (!extraShotId)
      return NextResponse.json("Extra Shot Id is required", { status: 400 });
    const extraShot = await prisma.extraShot.findUnique({
      where: { id: extraShotId },
      include: { product: { include: { category: true } } },
    });
    if (!extraShot)
      return NextResponse.json("Extra Shot not found", { status: 404 });
    return NextResponse.json(extraShot);
  } catch (error) {
    console.log("[EXTRA_SHOT_GET]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ extraShotId: string }> }
) {
  try {
    const { extraShotId } = await params;
    const body = await req.json();
    const { name, productId, priceModifier } = await body;
    if (!extraShotId)
      return NextResponse.json("Extra Shot Id is required", { status: 400 });
    if (!name) return NextResponse.json("name is required", { status: 400 });
    if (!productId)
      return NextResponse.json("productId is required", { status: 400 });
    if (priceModifier === undefined)
      return NextResponse.json("priceModifier is required", { status: 400 });
    const extraShot = await prisma.extraShot.update({
      where: { id: extraShotId },
      data: { name, productId, priceModifier },
    });
    return NextResponse.json(extraShot);
  } catch (error) {
    console.log("EXTRA_SHOT_PATCH", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ extraShotId: string }> }
) {
  try {
    const { extraShotId } = await params;
    if (!extraShotId)
      return NextResponse.json("Extra Shot Id is required", { status: 400 });

    const extraShot = await prisma.extraShot.delete({
      where: { id: extraShotId },
    });
    return NextResponse.json(extraShot);
  } catch (error) {
    console.log("EXTRA_SHOT_DELETE", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}
