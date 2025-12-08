import { Sugar } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ sugarId: string }> }
) {
  try {
    const { sugarId } = await params;
    if (!sugarId)
      return NextResponse.json("Sugar Id is required", { status: 400 });
    const sugar = await prisma.sugar.findUnique({
      where: { id: sugarId },
      include: { product: { include: { category: true } } },
    });
    return NextResponse.json(sugar);
  } catch (error) {
    console.log("[SUGAR_GET]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ sugarId: string }> }
) {
  try {
    const { sugarId } = await params;
    const body = await req.json();
    const { name, productId } = await body;
    if (!sugarId)
      return NextResponse.json("Sugar Id is required", { status: 400 });
    if (!name) return NextResponse.json("name is required", { status: 400 });
    if (!productId)
      return NextResponse.json("productId is required", { status: 400 });
    const currentSugars = await prisma.sugar.findMany({ where: { productId } });
    const existedSugar = currentSugars.find(
      (sugar: Sugar) => sugar.name === name
    );
    if (existedSugar) {
      return NextResponse.json("Sugar's already existed!", { status: 400 });
    }
    const sugar = await prisma.sugar.update({
      where: { id: sugarId },
      data: { name, productId },
    });
    return NextResponse.json(sugar);
  } catch (error) {
    console.log("SUGAR_PATCH", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ sugarId: string }> }
) {
  try {
    const { sugarId } = await params;
    if (!sugarId)
      return NextResponse.json("Sugar Id is required", { status: 400 });

    const sugar = await prisma.sugar.delete({ where: { id: sugarId } });
    return NextResponse.json(sugar);
  } catch (error) {
    console.log("SUGAR_DELETE", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}
