import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: { orderId: string } }
) {
  try {
    const { orderId } = await params;
    const body = await req.json();
    const { userId, orderStatus, paymentMethod, paymentStatus, total } = body;
    if (!orderId)
      return NextResponse.json("Order Id is required!", { status: 400 });
    if (!userId)
      return NextResponse.json("User Id is required!", { status: 400 });
    if (!orderStatus)
      return NextResponse.json("Order status is required!", { status: 400 });
    if (!paymentMethod)
      return NextResponse.json("Payment method is required!", { status: 400 });
    if (!paymentStatus)
      return NextResponse.json("Payment status is required!", { status: 400 });
    if (!total)
      return NextResponse.json("Total price of order is required!", {
        status: 400,
      });
    const order = await prisma.order.update({
      where: { id: orderId },
      data: { userId, orderStatus, paymentMethod, paymentStatus, total },
    });
    return NextResponse.json(order);
  } catch (error) {
    console.error("[ORDER_PATCH]", { status: 500 });
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
    console.error("[ORDER_DELETE]", { status: 500 });
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
