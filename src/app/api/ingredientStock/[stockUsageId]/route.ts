import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: { stockUsageId: string } }
) {
  try {
    const { stockUsageId } = await params;
    if (!stockUsageId)
      return new NextResponse("Ingredient stock Id is required", {
        status: 400,
      });
    const ingredientStock = await prisma.ingredientStock.findUnique({
      where: { id: stockUsageId },
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
    const { ingredientId, quantity, status, note, userId } = body;
    const { stockUsageId } = await params;
    
    if (!stockUsageId)
      return new NextResponse("Ingredient stock Id is required", {
        status: 400,
      });
    if (!ingredientId)
      return NextResponse.json("ingredient id is required", { status: 400 });
    if (!quantity)
      return NextResponse.json("quantity is required", { status: 400 });
    if (!userId)
      return NextResponse.json("User id is required", { status: 400 });
    if (!status)
      return NextResponse.json("status is required", { status: 400 });
      
    const quantityNum = parseInt(quantity);
    if (isNaN(quantityNum)) {
      return NextResponse.json("quantity must be a valid number", {
        status: 400,
      });
    }

    // Get the current ingredient stock record
    const ingredientStockData = await prisma.ingredientStock.findUnique({
      where: { id: stockUsageId },
    });

    if (!ingredientStockData) {
      return new NextResponse("Ingredient stock record not found", {
        status: 404,
      });
    }

    // Get the old ingredient data
    const oldIngredient = await prisma.ingredient.findUnique({
      where: { id: ingredientStockData.ingredientId },
    });

    // Get the new ingredient data
    const newIngredient = await prisma.ingredient.findUnique({
      where: { id: ingredientId },
    });

    if (!oldIngredient || !newIngredient) {
      return new NextResponse("Ingredient not found", { status: 404 });
    }

    // Check if the ingredient has changed
    if (ingredientStockData.ingredientId !== ingredientId) {
      // RESTORE stock to the OLD ingredient (add back the previously used quantity)
      await prisma.ingredient.update({
        where: { id: ingredientStockData.ingredientId },
        data: {
          stock: Number(oldIngredient.stock) + Number(ingredientStockData.quantity)
        }
      });

      // DEDUCT stock from the NEW ingredient (subtract the new quantity)
      await prisma.ingredient.update({
        where: { id: ingredientId },
        data: {
          stock: Number(newIngredient.stock) - quantityNum
        }
      });
    } else {
      // Same ingredient, just quantity changed
      // Calculate the difference and adjust stock accordingly
      const quantityDifference = quantityNum - Number(ingredientStockData.quantity);
      
      await prisma.ingredient.update({
        where: { id: ingredientId },
        data: {
          stock: Number(newIngredient.stock) - quantityDifference
        }
      });
    }

    // Update the ingredient stock record
    const ingredientStock = await prisma.ingredientStock.update({
      where: { id: stockUsageId },
      data: { ingredientId, quantity: quantityNum, status, note, userId },
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
    const { stockUsageId } = await params;
    if (!stockUsageId)
      return new NextResponse("Ingredient  stock Id is required", {
        status: 400,
      });
    const ingredientStockData = await prisma.ingredientStock.findUnique({
      where: { id: stockUsageId },
    });
    const ingredient = await prisma.ingredient.findUnique({
      where: { id: ingredientStockData?.ingredientId },
    });
    await prisma.ingredient.update({
      where: { id: ingredientStockData?.ingredientId },
      data: {
        stock:
          Number(ingredient?.stock) + Number(ingredientStockData?.quantity),
      },
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
