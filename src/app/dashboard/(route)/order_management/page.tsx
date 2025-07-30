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
    product: {
      name: string;
      discount: number;
      price: number;
    };
    size: {
      name: string;
      priceModifier: number;
    };
    sugar: string;
    quantity: number;
    note: string;
    price: number;
  }[];
};

async function OrderManagementPage() {
  try {
    await checkPermission(["view:order_management"]);

    const orders = await prisma.order.findMany({
      include: {
        user: { include: { role: true } },
        orderItems: { include: { product: true, size: true } },
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
        product: {
          name: orderItem.product.name,
          discount: orderItem.product.discount ?? 0, // Use nullish coalescing to default to 0
          price: orderItem.product.price.toNumber(),
        },
        size: {
          name: orderItem.size.sizeName,
          priceModifier: orderItem.size.priceModifier.toNumber() ?? 0,
        },
        sugar: orderItem.sugar,
        quantity: orderItem.quantity,
        note: orderItem.note || "",
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
    // You might want to render an error component here
    throw error;
  }
}

export default OrderManagementPage;
