import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: { orderItemId: string } }
) {
  try {
    const { orderItemId } = await params;
    const body = await req.json();
    const { 
      quantity, 
      price, 
      sizeId, 
      sugarId, 
      iceId, 
      extraShotId, 
      note 
    } = body;

    if (!orderItemId)
      return NextResponse.json("Order Item Id is required!", { status: 400 });

    // Prepare update data - only include fields that are provided
    const updateData: any = {};
    if (quantity !== undefined) updateData.quantity = quantity;
    if (price !== undefined) updateData.price = price;
    if (sizeId !== undefined) updateData.sizeId = sizeId;
    if (sugarId !== undefined) updateData.sugarId = sugarId;
    if (iceId !== undefined) updateData.iceId = iceId;
    if (extraShotId !== undefined) updateData.extraShotId = extraShotId;
    if (note !== undefined) updateData.note = note;

    const orderItem = await prisma.orderItem.update({
      where: { id: orderItemId },
      data: updateData,
    });

    return NextResponse.json(orderItem);
  } catch (error) {
    console.error("[ORDER_ITEM_PATCH]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { orderItemId: string } }
) {
  try {
    const { orderItemId } = await params;
    if (!orderItemId) {
      return NextResponse.json("Order Item Id is required!", { status: 400 });
    }

    const orderItem = await prisma.orderItem.delete({ 
      where: { id: orderItemId } 
    });

    return NextResponse.json(orderItem);
  } catch (error) {
    console.error("[ORDER_ITEM_DELETE]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}