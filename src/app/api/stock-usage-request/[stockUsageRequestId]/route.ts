import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  { params }: { params: { stockUsageRequestId: string } }
) {
  try {
    const body = await request.json();
    const { stockUsageRequestId } = await params;
    const { approvalStatus, rejectionReason, approvedById, approvedAt } = body;
    if (!stockUsageRequestId)
      return NextResponse.json("Stock usage request id is required", {
        status: 400,
      });
    const stockUsageRequest = await prisma.pendingStockUsage.update({
      where: { id: stockUsageRequestId },
      data: {
        approvalStatus,
        approvedById,
        rejectionReason,
        approvedAt,
      },
    });
    if (stockUsageRequest.approvalStatus === "Approved") {
      await prisma.ingredientStock.create({
        data: {
          ingredientId: stockUsageRequest.ingredientId,
          quantity: stockUsageRequest.quantity,
          userId: stockUsageRequest.userId,
          status: stockUsageRequest.status,
          note: stockUsageRequest.note,
        },
      });
      await prisma.ingredient.update({
        where: { id: stockUsageRequest.ingredientId },
        data: {
          stock: {
            decrement: stockUsageRequest.quantity,
          },
        },
      });
    }

    return NextResponse.json(stockUsageRequest, { status: 200 });
  } catch (error) {
    console.error("[STOCK_USAGE_REQUEST PATCH]", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
