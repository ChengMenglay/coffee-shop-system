"use client";
import { DashboardStats, SectionCards } from "@/components/section-cards";
import React from "react";
import { PendingOrder } from "./(route)/order_management/page";
import { Ingredient } from "@/generated/prisma";
import { ChartLineDots } from "@/components/chart-line-dots";
import { ChartPieLabelList } from "@/components/chat-pie-list";
import { DataTable } from "@/components/ui/data-table";
import {
  columns,
  OrderManagementColumn,
} from "./(route)/order_management/components/column";
import { formatterUSD } from "@/lib/utils";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";

interface OverviewProps {
  todayOrders: PendingOrder[];
  yesterdayOrders: PendingOrder[];
allOrders: PendingOrder[];
  ingredients: Ingredient[];
}

function Overview({
  todayOrders,
  yesterdayOrders,
    allOrders,
  ingredients,
}: OverviewProps) {
  const calculatePercentageChange = (
    current: number,
    previous: number
  ): number => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };
  const getPeakHours = (orders: PendingOrder[]) => {
    // 1. Handle edge case - if no orders, return default peak hours
    if (orders.length === 0) return { start: "9 AM", end: "11 AM" };

    // 2. Count orders by hour of the day
    const hourOrder: { [key: number]: number } = {};
    orders.forEach((order) => {
      const hour = new Date(order.createdAt).getHours(); // Extract hour (0-23)
      hourOrder[hour] = (hourOrder[hour] || 0) + 1; // Count orders per hour
    });

    // 3. Find the hour with the most orders
    const peakHour = Object.entries(hourOrder).sort(
      ([, a], [, b]) => b - a // Sort by count (descending)
    )[0]?.[0]; // Get the hour with highest count

    // 4. Handle case where no peak hour is found
    if (!peakHour) return { start: "9 AM", end: "11 AM" };

    // 5. Convert 24-hour format to 12-hour format and create a 2-hour window
    const hour = parseInt(peakHour);
    const startHour =
      hour === 0 ? "12 AM" : hour < 12 ? `${hour} AM` : `${hour - 12} PM`;
    const endHour =
      hour + 2 === 0
        ? "12 AM"
        : hour + 2 <= 12
        ? `${hour + 2} AM`
        : `${hour + 2 - 12} PM`;

    return { start: startHour, end: endHour };
  };

  const todayRevenue = todayOrders.reduce(
    (sum, order) => sum + Number(order.total),
    0
  );
  const yesterdayRevenue = yesterdayOrders.reduce(
    (sum, order) => sum + Number(order.total),
    0
  );
  const todayOrdersCount = todayOrders.length;
  const yesterdayOrdersCount = yesterdayOrders.length;

  //Calculate total Tablet order
  const todayTabletOrder = todayOrders.filter(
    (order) => order.user.role.name === "Tablet"
  ).length;

  const counterOrders = todayOrdersCount - todayTabletOrder;

  const peakHours = getPeakHours(todayOrders);

  const lowStockItemsCount = ingredients.filter(
    (stock) => stock.stock <= stock.lowStockThreshold
  ).length;
  const lowStockItems = ingredients
    .filter((stock) => stock.stock <= stock.lowStockThreshold)
    .map((stock) => stock.name)
    .join(", ");
  const stats: DashboardStats = {
    todayRevenue: todayRevenue,
    revenueChange: calculatePercentageChange(todayRevenue, yesterdayRevenue),
    revenueTarget: 100, // Set your daily target
    isRevenueTargetMet: todayRevenue >= 100,

    // Orders Card
    todayOrders: todayOrdersCount,
    ordersChange: todayOrdersCount - yesterdayOrdersCount,
    peakHoursStart: peakHours.start,
    peakHoursEnd: peakHours.end,

    // Tablet Orders Card
    tabletOrders: todayTabletOrder,
    counterOrders: counterOrders,
    tabletOrdersPercentage:
      todayOrdersCount > 0 ? (todayTabletOrder / todayOrdersCount) * 100 : 0,

    // Low Stock Card (you'll need to get this from inventory)
    lowStockItemsCount: lowStockItemsCount,
    lowStockItems: [lowStockItems],
  };

  // Calculate monthly revenue data for line chart
  const getMonthlyRevenue = () => {
    const monthlyData: { [key: string]: number } = {};

    allOrders.forEach((order) => {
      const month = new Date(order.createdAt).toLocaleDateString("en", {
        month: "short",
      });
      monthlyData[month] = (monthlyData[month] || 0) + Number(order.total);
    });

    return Object.entries(monthlyData)
      .slice(-6) // Last 6 months
      .map(([month, revenue]) => ({
        month,
        desktop: Math.round(revenue),
      }));
  };

  const formattedOrders: OrderManagementColumn[] = todayOrders.map((order) => ({
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

  return (
    <div>
      <div></div>
      <SectionCards stats={stats} />
      <div className="my-2"></div>
      <div className="grid md:grid-cols-2 grid-cols-1    gap-4">
        <ChartLineDots data={getMonthlyRevenue()} />
        <ChartPieLabelList orders={todayOrders} />
      </div>
      <Card className="my-2 px-2">
        <h2 className="text-lg font-medium">Recent Orders</h2>
        <DataTable columns={columns} data={formattedOrders} />
      </Card>
    </div>
  );
}

export default Overview;
