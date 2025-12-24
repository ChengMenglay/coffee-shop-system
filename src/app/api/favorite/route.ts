import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json("User Id is required", { status: 400 });
    }
    const favorites = await prisma.favorite.findMany({
      where: { userId },
      include: { product: { include: { category: true } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ favorites });
  } catch (error) {
    console.log("[FAVORITE_GET]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const productId = searchParams.get("productId");
    if (!userId) {
      return NextResponse.json("User Id is required", { status: 400 });
    }
    if (!productId) {
      return NextResponse.json("Product Id is required", { status: 400 });
    }
    const favorite = await prisma.favorite.create({
      data: { userId, productId },
    });
    return NextResponse.json(favorite);
  } catch (error) {
    console.log("[FAVORITE_POST]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const productId = searchParams.get("productId");
    if (!userId) {
      return NextResponse.json("User Id is required", { status: 400 });
    }
    if (!productId) {
      return NextResponse.json("Product Id is required", { status: 400 });
    }
    const deletedFavorite = await prisma.favorite.delete({
      where: { userId_productId: { userId, productId } },
    });
    return NextResponse.json(deletedFavorite);
  } catch (error) {
    console.log("[FAVORITE_DELETE]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
