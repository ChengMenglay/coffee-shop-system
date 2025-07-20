import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { ingredientId, supplierId, userId, quantity, note, price } = body;
    if (
      !ingredientId ||
      !supplierId ||
      !userId ||
      !quantity ||
      !price
    ) {
      return NextResponse.json("Missing required fields", { status: 400 });
    }
    const newPurchaseRequest = await prisma.pendingPurchase.create({
      data: {
        ingredientId,
        supplierId,
        userId,
        quantity,
        note,
        price,
      },
    });
    return NextResponse.json(newPurchaseRequest);
  } catch (error) {
    console.error("[PURCHASE_REQUEST POST]", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}
