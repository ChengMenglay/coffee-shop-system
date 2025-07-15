import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: { ingredientId: string } }
) {
  try {
    const { ingredientId } = await params;
    if (!ingredientId)
      return new NextResponse("Ingredient Id is required", { status: 400 });
    const ingredient = await prisma.ingredient.findUnique({
      where: { id: ingredientId },
    });
    return NextResponse.json(ingredient);
  } catch (error) {
    console.log("[INGREDIENT_GET]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { ingredientId: string } }
) {
  try {
    const body = await req.json();
    const { name, stock, unit, lowStockThreshold } = body;
    const { ingredientId } = await params;
    if (!ingredientId)
      return new NextResponse("Ingredient Id is required", { status: 400 });
    if (!name) return NextResponse.json("Name is required", { status: 400 });
    if (!stock) return NextResponse.json("Stock is required", { status: 400 });
    if (!unit) return NextResponse.json("Unit is required", { status: 400 });
    if (!lowStockThreshold)
      return NextResponse.json("Low stock threshold is required", {
        status: 400,
      });
    const ingredient = await prisma.ingredient.update({
      where: { id:ingredientId },
      data: { name, stock, unit, lowStockThreshold },
    });
    return NextResponse.json(ingredient);
  } catch (error) {
    console.log("[INGREDIENT_PATCH]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { ingredientId: string } }
) {
  try {
    const { ingredientId } = await params;
    if (!ingredientId)
      return new NextResponse("Ingredient Id is required", { status: 400 });
    const ingredient = await prisma.ingredient.delete({
      where: { id: ingredientId },
    });
    return NextResponse.json(ingredient);
  } catch (error) {
    console.log("[INGREDIENT_DELETE]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
