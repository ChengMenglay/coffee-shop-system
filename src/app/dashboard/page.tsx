import Header from "@/components/Header";
import { checkPermission } from "@/lib/check-permission";
import React from "react";
import Overview from "./Overview";
import { prisma } from "@/lib/prisma";
async function DashboardPage() {
  await checkPermission(["view:dashboard"]);

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

  const [todayOrdersRaw, yesterdayOrdersRaw, allOrdersRaw, ingredients] =
    await Promise.all([
      // Today's orders
      prisma.order.findMany({
        where: {
          orderStatus: "Completed",
          paymentStatus: true,
          createdAt: {
            gte: today,
            lt: tomorrow,
          },
        },
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
      }),

      // Yesterday's orders
      prisma.order.findMany({
        where: {
          orderStatus: "Completed",
          paymentStatus: true,
          createdAt: {
            gte: yesterday,
            lt: today,
          },
        },
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
      }),
      // All orders
      prisma.order.findMany({
        where: { orderStatus: "Completed", paymentStatus: true },
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
      }),

      //Ingredient Stocks
      prisma.ingredient.findMany({
        orderBy: {
          name: "asc",
        },
      }),
    ]);

  // Convert Decimal objects to numbers for client component
  const convertOrderData = (orders: typeof todayOrdersRaw) => {
    return orders.map((order) => ({
      id: order.id,
      userId: order.userId,
      displayId: order.displayId,
      total: order.total.toNumber(),
      paymentMethod: order.paymentMethod,
      oderFrom: order.oderFrom,
      orderStatus: order.orderStatus,
      paymentStatus: order.paymentStatus,
      discount: order.discount.toNumber(),
      discountVoucher: order.discountVoucher.toNumber(),
      voucherCode: order.voucherCode,
      pickupTime: order.pickupTime,
      createdAt: order.createdAt.toLocaleString(),
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
  };

  // Convert all order data
  const todayOrders = convertOrderData(todayOrdersRaw);
  const yesterdayOrders = convertOrderData(yesterdayOrdersRaw);
  const allOrders = convertOrderData(allOrdersRaw);

  return (
    <div className="px-4 py-8">
      <Header
        title="Dashboard"
        subtitle="Manage your dashboard settings and view analytics."
      />
      <div className="my-2">
        <Overview
          todayOrders={todayOrders}
          yesterdayOrders={yesterdayOrders}
          allOrders={allOrders}
          ingredients={ingredients}
        />
      </div>
    </div>
  );
}

export default DashboardPage;
