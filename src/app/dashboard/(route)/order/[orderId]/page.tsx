import React from "react";
import OrderInvoice from "./Reciept";
import { prisma } from "@/lib/prisma";
import { OrderItem } from "types";
import { checkPermission } from "@/lib/check-permission";

async function OrderReciept({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  await checkPermission(["view:receipt"]);
  const { orderId } = await params;

  const orderItems = await prisma.orderItem.findMany({
    where: { orderId },
    include: {
      size: true,
      sugar: true,
      extraShot: true,
      ice: true,
      product: true,
      order: {
        include: {
          user: {
            include: {
              role: true,
            },
          },
        },
      },
    },
  });

  const formattedOrderItems: OrderItem[] = orderItems.map((item) => ({
    id: item.id,
    order: {
      id: item.order.id,
      displayId: item.order.displayId,
      createdAt: item.order.createdAt,
      user: {
        id: item.order.user.id,
        name: item.order.user.name,
        phone: item.order.user.phone ?? "",
        role: {
          id: item.order.user.role.id,
          name: item.order.user.role.name,
        },
      },
      orderStatus: item.order.orderStatus,
      paymentStatus: item.order.paymentStatus,
      paymentMethod: item.order.paymentMethod,
      discount: item.order.discount.toNumber(),
      total: item.order.total.toNumber(),
    },
    productId: {
      id: item.product.id,
      categoryId: item.product.categoryId,
      name: item.product.name,
      price: Number(item.product.price),
      discount: item.product.discount ? Number(item.product.discount) : null,
      description: item.product.description,
      status: item.product.status,
      image: item.product.image,
    },
    quantity: item.quantity,
    price: Number(item.price),

    // Size information - handle null case
    sizeId: item.sizeId,
    size: item.size
      ? {
          id: item.size.id,
          sizeName: item.size.sizeName,
          priceModifier: item.size.priceModifier.toNumber(),
          productId: item.size.productId,
          fullPrice: item.size.fullPrice.toNumber(),
        }
      : undefined, // Use undefined instead of null

    // Sugar information
    sugarId: item.sugarId,
    sugar: item.sugar?.name || undefined, // Use undefined instead of null

    // Ice information
    iceId: item.iceId,
    ice: item.ice?.name || undefined, // Use undefined instead of null

    // Extra shot information
    extraShotId: item.extraShotId,
    extraShot: item.extraShot
      ? {
          id: item.extraShot.id,
          name: item.extraShot.name,
          priceModifier: item.extraShot.priceModifier.toNumber(),
        }
      : undefined, // Use undefined instead of null

    // Item note
    note: item.note,
  }));

  return (
    <div>
      <OrderInvoice orderItems={formattedOrderItems} />
    </div>
  );
}

export default OrderReciept;
