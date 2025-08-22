import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    let whereClause = {};
    if (status) {
      whereClause = { orderStatus: status };
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        orderItems: {
          include: {
            product: true,
            size: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("[ORDERS_GET]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, orderId } = body;

    if (action === "complete" && orderId) {
      const order = await prisma.order.update({
        where: { id: orderId },
        data: { orderStatus: "Completed" },
      });
      return NextResponse.json(order);
    }

    if (action === "cancel" && orderId) {
      const order = await prisma.order.update({
        where: { id: orderId },
        data: { orderStatus: "Cancelled" },
      });
      return NextResponse.json(order);
    }

    return new NextResponse("Invalid action", { status: 400 });
  } catch (error) {
    console.error("[ORDERS_POST]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
