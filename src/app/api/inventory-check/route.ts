import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    // Get all ingredients with their current stock levels
    const ingredients = await prisma.ingredient.findMany({
      select: {
        id: true,
        name: true,
        stock: true,
        lowStockThreshold: true,
        unit: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    const inventoryItems = ingredients.map((ingredient) => ({
      id: ingredient.id,
      name: ingredient.name,
      currentStock: ingredient.stock,
      threshold: ingredient.lowStockThreshold,
      unit: ingredient.unit || "units",
      isLow: ingredient.stock <= ingredient.lowStockThreshold,
    }));

    const lowStockCount = inventoryItems.filter((item) => item.isLow).length;

    return NextResponse.json({
      items: inventoryItems,
      lowStockCount,
      totalItems: inventoryItems.length,
    });
  } catch (error) {
    console.error("[INVENTORY_CHECK_GET]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items } = body;

    // You could create inventory check records here
    // For now, we'll just validate and return success

    let totalDiscrepancies = 0;
    const results = [];

    for (const item of items) {
      if (item.physicalCount !== undefined) {
        const discrepancy = Math.abs(item.physicalCount - item.currentStock);
        totalDiscrepancies += discrepancy;

        results.push({
          id: item.id,
          name: item.name,
          systemStock: item.currentStock,
          physicalCount: item.physicalCount,
          discrepancy,
          notes: item.notes || "",
        });

        // Optionally update the actual stock if the discrepancy is accepted
        // await prisma.ingredient.update({
        //   where: { id: item.id },
        //   data: { stock: item.physicalCount }
        // });
      }
    }

    return NextResponse.json({
      success: true,
      totalDiscrepancies,
      checkedItems: results.length,
      message: `Inventory check completed. ${
        results.length
      } items checked with total discrepancy of ${totalDiscrepancies.toFixed(
        2
      )}`,
      results,
    });
  } catch (error) {
    console.error("[INVENTORY_CHECK_POST]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
