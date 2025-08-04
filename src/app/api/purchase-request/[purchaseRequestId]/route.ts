import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ purchaseRequestId: string }> }
) {
  try {
    const body = await request.json();
    const { purchaseRequestId } = await params;
    const { approvalStatus, rejectionReason, approvedById, approvedAt } = body;
    if (!purchaseRequestId)
      return NextResponse.json("Purchase request id is required", {
        status: 400,
      });
    const purchaseRequest = await prisma.pendingPurchase.update({
      where: { id: purchaseRequestId },
      data: {
        approvalStatus,
        approvedById,
        rejectionReason,
        approvedAt,
      },
    });
    if (purchaseRequest.approvalStatus === "Approved") {
      await prisma.purchase.create({
        data: {
          ingredientId: purchaseRequest.ingredientId,
          quantity: purchaseRequest.quantity,
          price: purchaseRequest.price,
          supplierId: purchaseRequest.supplierId,
          userId: purchaseRequest.userId,
        },
      });
      await prisma.ingredient.update({
        where: { id: purchaseRequest.ingredientId },
        data: {
          stock: {
            increment: purchaseRequest.quantity,
          },
        },
      });
    }

    return NextResponse.json(purchaseRequest, { status: 200 });
  } catch (error) {
    console.error("[PURCHASE_REQUEST PATCH]", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
