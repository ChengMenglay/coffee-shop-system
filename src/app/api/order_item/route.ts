import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderId, productId, quantity, price, sizeId, sugar, note } = body;
    if (!orderId)
      return NextResponse.json("Order Id is required!", { status: 400 });
    if (!productId)
      return NextResponse.json("product Id status is required!", {
        status: 400,
      });
    if (!quantity)
      return NextResponse.json("quantity is required!", { status: 400 });
    if (!price) return NextResponse.json("Price is required!", { status: 400 });
    if (!sizeId)
      return NextResponse.json("Size Id of order is required!", {
        status: 400,
      });
    if (!sugar)
      return NextResponse.json("Sugar of order is required!", {
        status: 400,
      });
    const orderItem = await prisma.orderItem.create({
      data: {
        orderId,
        productId,
        quantity,
        price,
        sizeId,
        sugar,
        note,
      },
    });
    return NextResponse.json(orderItem);
  } catch (error) {
    console.error("[ORDERPOST]", { status: 500 });
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
