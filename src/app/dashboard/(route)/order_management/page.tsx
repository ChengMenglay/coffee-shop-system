import React from "react";
import { prisma } from "@/lib/prisma";
import { checkPermission } from "@/lib/check-permission";
import { OrderManagementColumn } from "./components/column";
import { format, formatDistanceToNowStrict } from "date-fns";
import OrderManagementClient from "./components/client";
import { formatterUSD } from "@/lib/utils";

export type PendingOrder = {
  id: string;
  userId: string;
  displayId: number;
  total: number;
  paymentMethod: string;
  orderStatus: string;
  paymentStatus: boolean;
  discount: number;
  createdAt: string;
  user: {
    name: string;
    role: {
      name: string;
    };
  };
  orderItems: {
    id: string;
    product: {
      name: string;
      discount?: number;
      price: number;
    };
    size?: {
      sizeName: string;
      priceModifier: number;
    } | null;
    sugar?: {
      name: string;
    } | null;
    ice?: {
      name: string;
    } | null;
    extraShot?: {
      name: string;
      priceModifier: number;
    } | null;
    quantity: number;
    note?: string | null;
    price: number;
  }[];
};

async function OrderManagementPage() {
  try {
    await checkPermission(["view:order_management"]);

    const orders = await prisma.order.findMany({
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
      orderBy: { createdAt: "desc" },
    });

    const formattedOrders: OrderManagementColumn[] = orders.map((order) => ({
      id: order.id,
      displayId: `#${order.displayId}`,
      user: `${order.user.name} (${order.user.role.name})`,
      product: order.orderItems
        .map((orderItem) => orderItem.product.name)
        .join(", "),
      userId: order.userId,
      orderStatus: order.orderStatus,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      total: formatterUSD.format(Number(order.total)),
      createdAt: format(order.createdAt, "dd MMMM yyyy"),
    }));

    const formattedPendingOrder: PendingOrder[] = orders.map((order) => ({
      id: order.id,
      userId: order.userId,
      displayId: order.displayId,
      total: order.total.toNumber(),
      paymentMethod: order.paymentMethod,
      orderStatus: order.orderStatus,
      paymentStatus: order.paymentStatus,
      discount: order.discount.toNumber(),
      createdAt: formatDistanceToNowStrict(new Date(order.createdAt), {
        addSuffix: true,
      }),
      user: {
        name: order.user.name,
        role: { name: order.user.role.name },
      },
      orderItems: order.orderItems.map((orderItem) => ({
        id: orderItem.id,
        product: {
          name: orderItem.product.name,
          discount: orderItem.product.discount || 0,
          price: orderItem.product.price.toNumber(),
        },
        size: orderItem.size
          ? {
              sizeName: orderItem.size.sizeName,
              priceModifier: orderItem.size.priceModifier.toNumber(),
            }
          : null,
        sugar: orderItem.sugar
          ? {
              name: orderItem.sugar.name,
            }
          : null,
        ice: orderItem.ice
          ? {
              name: orderItem.ice.name,
            }
          : null,
        extraShot: orderItem.extraShot
          ? {
              name: orderItem.extraShot.name,
              priceModifier: orderItem.extraShot.priceModifier.toNumber(),
            }
          : null,
        quantity: orderItem.quantity,
        note: orderItem.note || null,
        price: orderItem.price.toNumber(),
      })),
    }));

    return (
      <div className="flex-col">
        <div className="flex-1 space-y-4 px-6 py-8">
          <OrderManagementClient
            pendingOrderData={formattedPendingOrder}
            pendingCount={
              orders.filter((order) => order.orderStatus === "Pending").length
            }
            draftCount={
              orders.filter((order) => order.orderStatus === "Draft").length
            }
            orders={formattedOrders}
          />
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error fetching order management data:", error);
    throw error;
  }
}

export default OrderManagementPage;
