import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, contact, isActive, suppliedIngredients } = body;
    if (!name) return NextResponse.json("Name is required", { status: 400 });
    if (!Array.isArray(suppliedIngredients) || !suppliedIngredients.length) {
      return NextResponse.json("Ingredients supplied is required", {
        status: 400,
      });
    }
    const supplier = await prisma.supplier.create({
      data: {
        name,
        contact,
        isActive,
        suppliedIngredients: {
          connect: suppliedIngredients.map((ingredientId) => ({
            id: ingredientId,
          })),
        },
      },
    });
    return NextResponse.json(supplier);
  } catch (error) {
    console.log("[SUPPLIER_POST]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
