import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { ingredientId, quantity, status, note ,userId} = body;
    if (!ingredientId)
      return NextResponse.json("ingredient id is required", { status: 400 });
    if (!quantity)
      return NextResponse.json("quantity is required", { status: 400 });
    if (!status)
      return NextResponse.json("status is required", { status: 400 });
    if (!userId)
      return NextResponse.json("User id is required", { status: 400 });
    const quantityNum = parseInt(quantity);
    if (isNaN(quantityNum)) {
      return NextResponse.json("quantity must be a valid number", {
        status: 400,
      });
    }
    const ingredient = await prisma.ingredient.findUnique({
      where: { id: ingredientId },
    });
    //Update stock
    await prisma.ingredient.update({
      where: { id: ingredientId },
      data: { stock: Number(ingredient?.stock) - quantity },
    });
    const ingredientStock = await prisma.ingredientStock.create({
      data: { ingredientId, quantity: quantityNum, status, note ,userId},
    });
    return NextResponse.json(ingredientStock);
  } catch (error) {
    console.log("[INGREDIENT_STOCK_POST]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
