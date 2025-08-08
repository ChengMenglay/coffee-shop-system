import { prisma } from "@/lib/prisma";
import { sendOrderStatusUpdate } from "@/lib/telegram";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const { orderId } = params;

    // Fetch complete order with all relations
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: { include: { role: true } },
        orderItems: {
          include: {
            product: true,
            size: true,
            sugar: true,
            ice: true,
            extraShot: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Format order for notification
    const formattedOrder = {
      order: {
        id: order.id,
        userId: order.userId,
        displayId: order.displayId,
        total: order.total.toNumber(),
        paymentMethod: order.paymentMethod,
        orderStatus: order.orderStatus,
        paymentStatus: order.paymentStatus,
        discount: order.discount.toNumber(),
        createdAt: order.createdAt.toISOString(),
        user: {
          name: order.user.name,
          role: { name: order.user.role.name },
        },
        orderItems: order.orderItems.map((item) => ({
          id: item.id,
          product: {
            name: item.product.name,
            discount: item.product.discount || 0,
            price: item.product.price.toNumber(),
          },
          size: item.size ? {
            sizeName: item.size.sizeName,
            priceModifier: item.size.priceModifier.toNumber(),
          } : null,
          sugar: item.sugar ? { name: item.sugar.name } : null,
          ice: item.ice ? { name: item.ice.name } : null,
          extraShot: item.extraShot ? {
            name: item.extraShot.name,
            priceModifier: item.extraShot.priceModifier.toNumber(),
          } : null,
          quantity: item.quantity,
          note: item.note || null,
          price: item.price.toNumber(),
        })),
      }
    };

    await sendOrderStatusUpdate(formattedOrder, order.orderStatus);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error sending order notification:", error);
    return NextResponse.json({ error: "Failed to send notification" }, { status: 500 });
  }
}