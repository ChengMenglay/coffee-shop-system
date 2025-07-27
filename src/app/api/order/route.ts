import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      userId,
      orderStatus,
      paymentMethod,
      paymentStatus,
      total,
      discount,
    } = body;

    // ✅ Validation
    if (!userId)
      return NextResponse.json("User Id is required!", { status: 400 });
    if (!orderStatus)
      return NextResponse.json("Order status is required!", { status: 400 });
    if (!paymentMethod)
      return NextResponse.json("Payment method is required!", { status: 400 });
    if (paymentStatus === undefined)
      return NextResponse.json("Payment status is required!", { status: 400 });
    if (!total)
      return NextResponse.json("Total price of order is required!", {
        status: 400,
      });

    // 🔄 Find last order and calculate next displayId (1-100 loop)
    const lastOrder = await prisma.order.findFirst({
      orderBy: { createdAt: "desc" },
      select: { displayId: true },
    });

    // ✅ Safe calculation of nextDisplayId using optional chaining
    const nextDisplayId = ((lastOrder?.displayId ?? 0) % 100) + 1;

    // ✅ Create new order
    const newOrder = await prisma.order.create({
      data: {
        userId,
        displayId: nextDisplayId,
        orderStatus,
        paymentMethod,
        paymentStatus,
        discount,
        total,
      },
    });

    return NextResponse.json(newOrder);
  } catch (error) {
    console.error("[ORDER_POST]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
