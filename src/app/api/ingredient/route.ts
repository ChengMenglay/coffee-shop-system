import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, stock, unit, lowStockThreshold } = body;
    if (!name) return NextResponse.json("Name is required", { status: 400 });
    if (!stock) return NextResponse.json("Stock is required", { status: 400 });
    if (!unit) return NextResponse.json("Unit is required", { status: 400 });
    if (!lowStockThreshold)
      return NextResponse.json("Low stock threshold is required", {
        status: 400,
      });

    const ingredient = await prisma.ingredient.create({
      data: { name, stock, unit, lowStockThreshold },
    });
    return NextResponse.json(ingredient)
  } catch (error) {
    console.log("[INGREDIENT_POST]", error);
    return new NextResponse("Internal Server Error", {status:500})
  }
}
