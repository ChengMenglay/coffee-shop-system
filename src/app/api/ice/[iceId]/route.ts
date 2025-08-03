import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: { iceId: string } }
) {
  try {
    const { iceId } = await params;
    const body = await req.json();
    const { name, productId } = await body;
    if (!iceId)
      return NextResponse.json("Ice Id is required", { status: 400 });
    if (!name)
      return NextResponse.json("name is required", { status: 400 });
    if (!productId)
      return NextResponse.json("productId is required", { status: 400 });
    const currentIces = await prisma.ice.findMany({ where: { productId } });
    const existedIce = currentIces.find((ice) => ice.name === name);
    if (existedIce) {
      return NextResponse.json("Ice's already existed!", { status: 400 });
    }
    const ice = await prisma.ice.update({
      where: { id: iceId },
      data: { name, productId },
    });
    return NextResponse.json(ice);
  } catch (error) {
    console.log("ICE_PATCH", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { iceId: string } }
) {
  try {
    const { iceId } = await params;
    if (!iceId)
      return NextResponse.json("Ice Id is required", { status: 400 });

    const ice = await prisma.ice.delete({ where: { id: iceId } });
    return NextResponse.json(ice);
  } catch (error) {
    console.log("ICE_DELETE", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}
