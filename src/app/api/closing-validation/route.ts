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

    // Check if day is already closed
    const dayClose = await prisma.dayClose.findFirst({
      where: {
        date: new Date(date),
      },
    });

    if (dayClose) {
      return NextResponse.json({
        isAlreadyClosed: true,
        message: "Day has already been closed",
        closedAt: dayClose.closedAt,
        closedBy: dayClose.closedBy,
      });
    }

    // Get all validation data
    const [orders, pendingOrders, cashOrders, lowStockItems] =
      await Promise.all([
        // All orders for the day
        prisma.order.findMany({
          where: {
            createdAt: {
              gte: startOfDay,
              lte: endOfDay,
            },
            orderStatus: {
              not: { in: ["Draft", "Pending"] },
            },
          },
        }),

        // Pending/Draft orders
        prisma.order.findMany({
          where: {
            createdAt: {
              gte: startOfDay,
              lte: endOfDay,
            },
            orderStatus: {
              in: ["Draft", "Pending"],
            },
          },
        }),

        // Cash orders
        prisma.order.findMany({
          where: {
            createdAt: {
              gte: startOfDay,
              lte: endOfDay,
            },
            paymentMethod: "Cash",
            orderStatus: {
              not: "Draft",
            },
          },
        }),

        // Low stock items
        prisma.ingredient.findMany({
          where: {
            stock: {
              lte: prisma.ingredient.fields.lowStockThreshold,
            },
          },
        }),
      ]);

    // Calculate payment totals
    const paymentTotals = orders.reduce(
      (acc, order) => {
        const method = order.paymentMethod.toLowerCase();
        const total = Number(order.total);

        if (method === "cash") acc.cash += total;
        else if (method === "aba") acc.aba += total;
        else if (method === "credit card") acc.creditCard += total;

        return acc;
      },
      { cash: 0, aba: 0, creditCard: 0 }
    );

    const totalCashSales = cashOrders.reduce(
      (sum, order) => sum + Number(order.total),
      0
    );

    // Validation checks
    const validationResults = {
      cashCount: {
        required: true,
        completed: false, // This would be checked from actual cash count submission
        expectedAmount: totalCashSales,
        message: `Expected cash amount: $${totalCashSales.toFixed(2)}`,
      },
      inventoryCheck: {
        required: lowStockItems.length > 0,
        completed: false, // This would be checked from actual inventory submission
        lowStockCount: lowStockItems.length,
        message: `${lowStockItems.length} items are below threshold`,
      },
      paymentValidation: {
        required: true,
        completed:
          paymentTotals.cash > 0 ||
          paymentTotals.aba > 0 ||
          paymentTotals.creditCard > 0,
        paymentBreakdown: paymentTotals,
        message: `Cash: $${paymentTotals.cash.toFixed(
          2
        )}, ABA: $${paymentTotals.aba.toFixed(
          2
        )}, Credit: $${paymentTotals.creditCard.toFixed(2)}`,
      },
      pendingOrders: {
        required: true,
        completed: pendingOrders.length === 0,
        pendingCount: pendingOrders.length,
        message:
          pendingOrders.length > 0
            ? `${pendingOrders.length} orders are still pending`
            : "All orders completed",
        pendingOrderIds: pendingOrders.map((o) => o.id),
      },
      salesReport: {
        required: true,
        completed: orders.length > 0,
        totalOrders: orders.length,
        totalSales: orders.reduce((sum, order) => sum + Number(order.total), 0),
        message: `${orders.length} orders totaling $${orders
          .reduce((sum, order) => sum + Number(order.total), 0)
          .toFixed(2)}`,
      },
    };

    // Overall readiness
    const requiredChecks = Object.values(validationResults).filter(
      (check) => check.required
    );
    const completedChecks = requiredChecks.filter((check) => check.completed);
    const readyToClose = completedChecks.length === requiredChecks.length;

    return NextResponse.json({
      isAlreadyClosed: false,
      readyToClose,
      completedChecks: completedChecks.length,
      totalRequiredChecks: requiredChecks.length,
      validationResults,
      date,
    });
  } catch (error) {
    console.error("[CLOSING_VALIDATION_GET]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, stepType } = body;

    if (!date || !stepType) {
      return NextResponse.json("Date and step type are required", {
        status: 400,
      });
    }

    // Here you could save completion status for each step
    // For now, we'll just return success

    return NextResponse.json({
      success: true,
      stepType,
      message: `${stepType} validation completed successfully`,
      completedAt: new Date(),
    });
  } catch (error) {
    console.error("[CLOSING_VALIDATION_POST]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
