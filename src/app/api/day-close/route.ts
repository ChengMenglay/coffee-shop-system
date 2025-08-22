import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// Create a day close record
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, closeData } = body;

    console.log("[DAY_CLOSE] Received data:", {
      date,
      hasCloseData: !!closeData,
      hasHourlyBreakdown: !!closeData?.hourlyBreakdown,
      hourlyBreakdownLength: closeData?.hourlyBreakdown?.length || 0,
    });

    if (!date || !closeData) {
      return NextResponse.json("Date and close data are required", {
        status: 400,
      });
    }

    // Log the hourly breakdown specifically
    if (closeData.hourlyBreakdown) {
      console.log(
        "[DAY_CLOSE] Hourly breakdown data:",
        closeData.hourlyBreakdown
      );
    } else {
      console.log("[DAY_CLOSE] WARNING: No hourly breakdown data received!");
    }
    // Check if day is already closed
    const existingClose = await prisma.dayClose.findFirst({
      where: {
        date: new Date(date),
      },
    });

    if (existingClose) {
      return NextResponse.json("Day already closed", { status: 400 });
    }

    // Create day close record
    const dayClose = await prisma.dayClose.create({
      data: {
        date: new Date(date),
        totalSales: closeData.totalSales,
        totalOrders: closeData.totalOrders,
        totalCustomers: closeData.totalCustomers,
        closedBy: closeData.closedBy,
        cashSales: closeData.paymentMethods.cash,
        abaSales: closeData.paymentMethods.aba,
        creditCardSales: closeData.paymentMethods.creditCard,
        topProducts: JSON.stringify(closeData.topProducts),
        promotionsUsed: JSON.stringify(closeData.promotionsUsed),
        lowStockItems: JSON.stringify(closeData.lowStockItems),
        hourlyBreakdown: JSON.stringify(closeData.hourlyBreakdown),
        closedAt: new Date(),
      },
    });

    return NextResponse.json(dayClose);
  } catch (error) {
    console.error("[DAY_CLOSE_POST]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// Get day close records
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");

    if (date) {
      // Get specific day close
      const dayClose = await prisma.dayClose.findFirst({
        where: {
          date: new Date(date),
        },
      });
      return NextResponse.json(dayClose);
    } else {
      // Get recent day closes
      const dayCloses = await prisma.dayClose.findMany({
        orderBy: {
          date: "desc",
        },
        take: 30, // Last 30 days
      });
      return NextResponse.json(dayCloses);
    }
  } catch (error) {
    console.error("[DAY_CLOSE_GET]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
