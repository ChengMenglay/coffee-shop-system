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

    // Get all cash orders for the day
    const cashOrders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
        paymentMethod: "Cash",
        orderStatus: "Completed",
        paymentStatus: true,
      },
    });

    const totalCashSales = cashOrders.reduce(
      (sum, order) => sum + Number(order.total),
      0
    );
    const totalCashOrders = cashOrders.length;

    // Calculate expected cash breakdown (common denominations)
    const denominations = [
      { value: 100, name: "$100", count: 0 },
      { value: 50, name: "$50", count: 0 },
      { value: 20, name: "$20", count: 0 },
      { value: 10, name: "$10", count: 0 },
      { value: 5, name: "$5", count: 0 },
      { value: 1, name: "$1", count: 0 },
      { value: 0.25, name: "Quarter", count: 0 },
      { value: 0.1, name: "Dime", count: 0 },
      { value: 0.05, name: "Nickel", count: 0 },
      { value: 0.01, name: "Penny", count: 0 },
    ];

    return NextResponse.json({
      totalCashSales,
      totalCashOrders,
      expectedCash: totalCashSales,
      denominations,
      orders: cashOrders.map((order) => ({
        id: order.id,
        displayId: order.displayId,
        total: order.total,
        createdAt: order.createdAt,
      })),
    });
  } catch (error) {
    console.error("[CASH_COUNT_GET]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, actualCash } = body;

    if (!date || actualCash === undefined) {
      return NextResponse.json("Date and actual cash amount are required", {
        status: 400,
      });
    }

    // You could store cash count records in a separate table
    // For now, we'll just validate and return the data

    const difference = actualCash - (body.expectedCash || 0);

    return NextResponse.json({
      success: true,
      actualCash,
      expectedCash: body.expectedCash || 0,
      difference,
      isAccurate: Math.abs(difference) < 0.01, // Within 1 cent
      message:
        Math.abs(difference) < 0.01
          ? "Cash count matches expected amount"
          : `Cash difference: ${difference > 0 ? "+" : ""}${difference.toFixed(
              2
            )}`,
    });
  } catch (error) {
    console.error("[CASH_COUNT_POST]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
