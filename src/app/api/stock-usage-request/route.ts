import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { ingredientId, userId, status, quantity, note } = body;
    if (!ingredientId || !userId || !quantity || !status) {
      return new Response("Missing required fields", { status: 400 });
    }
    const newStockUSageRequest = await prisma.pendingStockUsage.create({
      data: {
        ingredientId,
        userId,
        status,
        quantity,
        note,
      },
    });
    return NextResponse.json(newStockUSageRequest);
  } catch (error) {
    console.error("[STOCK_USAGE_REQUEST POST]", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
