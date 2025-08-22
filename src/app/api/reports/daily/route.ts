import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date =
      searchParams.get("date") || new Date().toISOString().split("T")[0];

    // Get start and end of the day
    const startOfDay = new Date(date + "T00:00:00.000Z");
    const endOfDay = new Date(date + "T23:59:59.999Z");

    // Get all orders for the day
    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
        orderStatus: "Completed",
      },
      include: {
        orderItems: {
          include: {
            product: true,
            size: true,
            sugar: true,
            ice: true,
            extraShot: true,
          },
        },
        user: true,
      },
    });

    // Calculate totals
    const totalSales = orders.reduce(
      (sum, order) => sum + Number(order.total),
      0
    );
    const totalOrders = orders.length;
    const totalCustomers = new Set(orders.map((order) => order.userId)).size;

    // Payment method breakdown
    const paymentMethods = orders.reduce(
      (acc, order) => {
        const method = order.paymentMethod.toLowerCase();
        if (method === "cash") acc.cash += Number(order.total);
        else if (method === "aba") acc.aba += Number(order.total);
        else if (method === "credit card")
          acc.creditCard += Number(order.total);
        return acc;
      },
      { cash: 0, aba: 0, creditCard: 0 }
    );

    // Top products
    const productSales = new Map();
    orders.forEach((order) => {
      order.orderItems.forEach((item) => {
        const key = item.product.name;
        if (productSales.has(key)) {
          const current = productSales.get(key);
          productSales.set(key, {
            name: key,
            quantity: current.quantity + item.quantity,
            revenue: current.revenue + Number(item.price) * item.quantity,
          });
        } else {
          productSales.set(key, {
            name: key,
            quantity: item.quantity,
            revenue: Number(item.price) * item.quantity,
          });
        }
      });
    });

    const topProducts = Array.from(productSales.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Get low stock items
    const lowStockItems = await prisma.ingredient.findMany({
      where: {
        stock: {
          lte: prisma.ingredient.fields.lowStockThreshold,
        },
      },
      select: {
        name: true,
        stock: true,
        lowStockThreshold: true,
      },
    });

    const formattedLowStockItems = lowStockItems.map((item) => ({
      name: item.name,
      currentStock: item.stock,
      threshold: item.lowStockThreshold,
    }));

    // Hourly breakdown
    const hourlyBreakdown = Array.from({ length: 17 }, (_, i) => {
      const hour = i + 7; // 7 AM to 11 PM
      const hourString = hour.toString().padStart(2, "0") + ":00";
      const hourOrders = orders.filter((order) => {
        const orderHour = new Date(order.createdAt).getHours();
        return orderHour === hour;
      });

      return {
        hour: hourString,
        orders: hourOrders.length,
        revenue: hourOrders.reduce(
          (sum, order) => sum + Number(order.total),
          0
        ),
      };
    });

    // Get orders with promotion discounts
    const totalPromotionDiscount = orders.reduce((sum, order) => {
      // Assuming you have a promotion discount field in your order
      return sum + (Number(order.discount) || 0);
    }, 0);

    // Count actual promotions used (this would need to be tracked in your order system)
    const promotionsUsed = [
      {
        name: "Total Discounts Applied",
        count: orders.filter((order) => Number(order.discount) > 0).length,
        totalDiscount: totalPromotionDiscount,
      },
    ];

    const dayData = {
      totalSales,
      totalOrders,
      totalCustomers,
      paymentMethods,
      topProducts,
      promotionsUsed,
      lowStockItems: formattedLowStockItems,
      hourlyBreakdown: hourlyBreakdown.filter((h) => h.orders > 0),
    };

    return NextResponse.json(dayData);
  } catch (error) {
    console.error("[DAILY_REPORT_GET]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
