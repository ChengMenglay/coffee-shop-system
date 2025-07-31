import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: { orderId: string } }
) {
  try {
    const { orderId } = await params;
    const body = await req.json();
    const { orderStatus, paymentStatus } = body;
    if (!orderId)
      return NextResponse.json("Order Id is required!", { status: 400 });
    const order = await prisma.order.update({
      where: { id: orderId },
      data: { orderStatus,paymentStatus },
    });
    return NextResponse.json(order);
  } catch (error) {
    console.error("[ORDER_PATCH]",error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { orderId: string } }
) {
  try {
    const { orderId } = await params;
    if (!orderId) {
      return NextResponse.json("Order Id is required!", { status: 400 });
    }
    const order = await prisma.order.delete({ where: { id: orderId } });
    return NextResponse.json(order);
  } catch (error) {
    console.error("[ORDER_DELETE]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
