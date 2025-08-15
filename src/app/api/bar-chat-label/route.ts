import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

interface ChartBarLabelFilter{
    period:'daily' | 'weekly' | 'monthly' | 'yearly';
    dateRange?: { from: string; to: string };
}

interface ProductSalesData{
    productName:string;
    totalSales:number;
    totalQuantity:number;
    totalRevenue:number;
}

async function calculateChartBarLabels(filter: ChartBarLabelFilter) {
    const { period, dateRange } = filter;
    try {
        const dateRanges= getDateRange(period, dateRange);
            if (!dateRanges) {
      throw new Error('Invalid date range');
    }
    const {start:currentStart, end:currentEnd} =dateRanges;
    const [currentSalesData] = await Promise.all([
      prisma.order.findMany({
        where: {
          orderStatus: "Completed",
          paymentStatus: true,
          createdAt: { gte: currentStart, lte: currentEnd }
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
    ]);
    const productSalesMap= new Map<string, ProductSalesData>();

    currentSalesData.forEach(order => {
      order.orderItems.forEach(item => {
        const productName = item.product.name;
        const quantity = item.quantity;
        const itemRevenue = Number(item.price) * quantity;

        if (productSalesMap.has(productName)) {
          const existing = productSalesMap.get(productName)!;
          existing.totalQuantity += quantity;
          existing.totalRevenue += itemRevenue;
          existing.totalSales += 1;
        } else {
          productSalesMap.set(productName, {
            productName,
            totalSales: 1,
            totalQuantity: quantity,
            totalRevenue: itemRevenue,
          });
        }
      });
    });

    const products= Array.from(productSalesMap.values()).sort((a,b)=>b.totalRevenue-a.totalRevenue);

    return products;
  } catch (error) {
    console.error('Error fetching products sales data:', error);
  }

function getDateRange(period:string,customRange?: { from: string; to: string }){
    const now= new Date();

    if(customRange){
        return {
            start:new Date(customRange.from),
            end:new Date(customRange.to)
        }
    }
switch (period) {
    case 'daily': {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      start.setHours(0, 0, 0, 0); // Start of day
      const end = new Date(start);
      end.setDate(end.getDate() + 1); // Next day at 00:00:00
      return { start, end };
    }
    
    case 'weekly': {
      const start = new Date(now);
      // Get Monday as start of week (or Sunday if you prefer)
      const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
      const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // If Sunday, go back 6 days to Monday
      
      start.setDate(now.getDate() - daysToMonday);
      start.setHours(0, 0, 0, 0); // Start of Monday
      
      const end = new Date(start);
      end.setDate(start.getDate() + 7); // Next Monday at 00:00:00
      
      return { start, end };
    }
    
    case 'monthly': {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      start.setHours(0, 0, 0, 0); // Start of month
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      end.setHours(0, 0, 0, 0); // Start of next month
      return { start, end };
    }
    
    case 'yearly': {
      const start = new Date(now.getFullYear(), 0, 1);
      start.setHours(0, 0, 0, 0); // Start of year
      const end = new Date(now.getFullYear() + 1, 0, 1);
      end.setHours(0, 0, 0, 0); // Start of next year
      return { start, end };
    }
    
    default:
      return null; // ADDED: Return null for unknown periods
  }
}
}

// GET endpoint
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = (searchParams.get('period') as 'daily' | 'weekly' | 'monthly' | 'yearly') || 'monthly';
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    const filter: ChartBarLabelFilter = {
      period,
      ...(from && to && { dateRange: { from, to } })
    };

    const productSales = await calculateChartBarLabels(filter);

    return NextResponse.json({
      success: true,
      data: productSales,
      period,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in GET product sales API:', error);
    
    // Return fallback mock data
    const mockData: ProductSalesData[] = [
      { productName: 'Cappuccino', totalSales: 45, totalQuantity: 67, totalRevenue: 2010 },
      { productName: 'Latte', totalSales: 38, totalQuantity: 52, totalRevenue: 1820 },
      { productName: 'Espresso', totalSales: 32, totalQuantity: 41, totalRevenue: 1230 },
      { productName: 'Americano', totalSales: 28, totalQuantity: 35, totalRevenue: 1050 },
      { productName: 'Mocha', totalSales: 25, totalQuantity: 31, totalRevenue: 1240 },
      { productName: 'Macchiato', totalSales: 22, totalQuantity: 28, totalRevenue: 980 },
    ];

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch product sales data',
      data: mockData,
      timestamp: new Date().toISOString(),
      fallback: true
    });
  }
}

export async function POST(request: NextRequest) {
    try {
    const body = await request.json();
    const { period, dateRange } = body;

    const filter: ChartBarLabelFilter = {
      period: period || 'monthly',
      dateRange
    };
    const productSales = await calculateChartBarLabels(filter);

      return NextResponse.json({
      success: true,
      data: productSales,
      filter,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in POST product sales API:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch product sales data',
      timestamp: new Date().toISOString()
    });
  }
}
