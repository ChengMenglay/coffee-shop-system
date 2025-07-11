import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: { stockUsageId: string } }
) {
  try {
    if (!params.stockUsageId)
      return new NextResponse("Ingredient stock Id is required", {
        status: 400,
      });
    const ingredientStock = await prisma.ingredientStock.findUnique({
      where: { id: params.stockUsageId },
    });
    return NextResponse.json(ingredientStock);
  } catch (error) {
    console.log("[INGREDIENT_STOCK_GET]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { stockUsageId: string } }
) {
  try {
    const body = await req.json();
    const { ingredientId, quantity, status, note } = body;
    if (!params.stockUsageId)
      return new NextResponse("Ingredient stock Id is required", {
        status: 400,
      });
    if (!ingredientId)
      return NextResponse.json("ingredient id is required", { status: 400 });
    if (!quantity)
      return NextResponse.json("quantity is required", { status: 400 });
    if (!status)
      return NextResponse.json("status is required", { status: 400 });
    const quantityNum = parseInt(quantity);
    if (isNaN(quantityNum)) {
      return NextResponse.json("quantity must be a valid number", {
        status: 400,
      });
    }
    const ingredientStockData = await prisma.ingredientStock.findUnique({
      where: { id: params.stockUsageId },
    });
    const ingredient = await prisma.ingredient.findUnique({
      where: { id: ingredientId },
    });
    await prisma.ingredient.update({
      where: { id: ingredientId },
      data: {
        stock:
          Number(ingredient.stock) +
          Number(ingredientStockData?.quantity) -
          quantity,
      },
    });
    const ingredientStock = await prisma.ingredientStock.update({
      where: { id: params.stockUsageId },
      data: { ingredientId, quantity, status, note },
    });
    return NextResponse.json(ingredientStock);
  } catch (error) {
    console.log("[INGREDIENT_STOCK_PATCH]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { stockUsageId: string } }
) {
  try {
    const { stockUsageId } = params;
    if (!stockUsageId)
      return new NextResponse("Ingredient  stock Id is required", {
        status: 400,
      });
    const ingredientStock = await prisma.ingredientStock.delete({
      where: { id: stockUsageId },
    });
    return NextResponse.json(ingredientStock);
  } catch (error) {
    console.log("[INGREDIENT_STOCK_DELETE]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
