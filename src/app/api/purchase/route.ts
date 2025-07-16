import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { ingredientId, quantity, price, supplierId, userId } = body;
    if (!userId)
      return NextResponse.json("User id is required", { status: 400 });
    if (!ingredientId)
      return NextResponse.json("ingredient id is required", { status: 400 });
    if (!quantity)
      return NextResponse.json("quantity is required", { status: 400 });
    if (!price) return NextResponse.json("Price is required", { status: 400 });

    if (!supplierId)
      return NextResponse.json("Supplier id is required", { status: 400 });
    const ingredient = await prisma.ingredient.findUnique({
      where: { id: ingredientId },
    });
    await prisma.ingredient.update({
      where: { id: ingredientId },
      data: { stock: ingredient?.stock + quantity },
    });
    const purchase = await prisma.purchase.create({
      data: { ingredientId, quantity, price, supplierId, userId },
    });
    return NextResponse.json(purchase);
  } catch (error) {
    console.log("[PURCHASES_POST]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
