import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const body = await req.json();
    const { orderStatus, paymentStatus } = body; // Add note field

    if (!orderId)
      return NextResponse.json("Order Id is required!", { status: 400 });

    // Prepare update data - only include fields that are provided
    const updateData: { orderStatus?: string; paymentStatus?: boolean } = {};
    if (orderStatus !== undefined) updateData.orderStatus = orderStatus;
    if (paymentStatus !== undefined) updateData.paymentStatus = paymentStatus;

    const order = await prisma.order.update({
      where: { id: orderId },
      data: {orderStatus:updateData.orderStatus, paymentStatus:updateData.paymentStatus},
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error("[ORDER_PATCH]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    if (!orderId) {
      return NextResponse.json("Order Id is required!", { status: 400 });
    }

    // Delete order items first (if not using CASCADE)
    await prisma.orderItem.deleteMany({
      where: { orderId }
    });

    // Then delete the order
    const order = await prisma.order.delete({ 
      where: { id: orderId } 
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error("[ORDER_DELETE]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}