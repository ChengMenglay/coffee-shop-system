import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

interface ReportFilters {
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  dateRange?: {
    from: string;
    to: string;
  };
}

async function calculateReport(filters: ReportFilters) {
  const { period, dateRange } = filters;
  
  try {
    const dateRanges = getDateRange(period, dateRange);
    if (!dateRanges) {
      throw new Error('Invalid date range');
    }

    const { start: currentStart, end: currentEnd } = dateRanges;
    
    // Calculate previous period for comparison
    const timeDiff = currentEnd.getTime() - currentStart.getTime();
    const previousStart = new Date(currentStart.getTime() - timeDiff);
    const previousEnd = new Date(currentEnd.getTime() - timeDiff);

    // Current period data
    const [currentSalesData, currentPurchases, currentIngredients] = await Promise.all([
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
      prisma.purchase.findMany({
        where: { createdAt: { gte: currentStart, lte: currentEnd } },
      }),
      prisma.ingredient.findMany({
        select: {
          id: true,
          name: true,
          stock: true,
        }
      })
    ]);

    // Previous period data for comparison
    const [previousSalesData, previousPurchases] = await Promise.all([
      prisma.order.findMany({
        where: {
          orderStatus: "Completed",
          paymentStatus: true,
          createdAt: { gte: previousStart, lte: previousEnd }
        },
        include: {
          orderItems: {
            include: { product: true },
          },
        },
      }),
      prisma.purchase.findMany({
        where: { createdAt: { gte: previousStart, lte: previousEnd } },
      })
    ]);

    // Calculate current metrics
    const currentTotalRevenue = currentSalesData.reduce((acc, order) => {
      return acc + Number(order.total);
    }, 0);

    const currentTotalOrders = currentSalesData.length;
    const currentAverageOrderValue = currentTotalOrders > 0 ? currentTotalRevenue / currentTotalOrders : 0;

    const currentTotalSpend = currentPurchases.reduce((acc, purchase) => {
      const total = Number(purchase.price) * Number(purchase.quantity);
      return acc + total;
    }, 0);

    const currentProfitMargin = currentTotalRevenue > 0 ? 
      ((currentTotalRevenue - currentTotalSpend) / currentTotalRevenue) * 100 : 0;

    // Calculate previous metrics
    const previousTotalRevenue = previousSalesData.reduce((acc, order) => {
      return acc + Number(order.total);
    }, 0);

    const previousTotalOrders = previousSalesData.length;
    const previousAverageOrderValue = previousTotalOrders > 0 ? previousTotalRevenue / previousTotalOrders : 0;

    const previousTotalSpend = previousPurchases.reduce((acc, purchase) => {
      const total = Number(purchase.price) * Number(purchase.quantity);
      return acc + total;
    }, 0);

    const previousProfitMargin = previousTotalRevenue > 0 ? 
      ((previousTotalRevenue - previousTotalSpend) / previousTotalRevenue) * 100 : 0;

    // Calculate top selling item
    const productQuantities: Record<string, { quantity: number; name: string }> = {};
    
    currentSalesData.forEach(order => {
      order.orderItems.forEach(item => {
        if (productQuantities[item.productId]) {
          productQuantities[item.productId].quantity += item.quantity;
        } else {
          productQuantities[item.productId] = {
            quantity: item.quantity,
            name: item.product.name
          };
        }
      });
    });

    const topSellingProduct = Object.values(productQuantities).reduce((max, current) => 
      current.quantity > max.quantity ? current : max, 
      { quantity: 0, name: 'No sales' }
    );

    // Calculate low stock items
    const lowStockItems = currentIngredients.filter(ingredient => ingredient.stock < 5);

    // Calculate percentage changes
    const calculatePercentageChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    // Get unique customers count
    const currentUniqueCustomers = new Set(currentSalesData.map(order => order.userId)).size;
    const previousUniqueCustomers = new Set(previousSalesData.map(order => order.userId)).size;

    const report = {
      totalSales: {
        current: currentTotalRevenue,
        previous: previousTotalRevenue,
        percentageChange: calculatePercentageChange(currentTotalRevenue, previousTotalRevenue),
      },
      totalSpend: {
        current: currentTotalSpend,
        previous: previousTotalSpend,
        percentageChange: calculatePercentageChange(currentTotalSpend, previousTotalSpend),
      },
      totalOrders: {
        current: currentTotalOrders,
        previous: previousTotalOrders,
        percentageChange: calculatePercentageChange(currentTotalOrders, previousTotalOrders),
      },
      averageOrderValue: {
        current: currentAverageOrderValue,
        previous: previousAverageOrderValue,
        percentageChange: calculatePercentageChange(currentAverageOrderValue, previousAverageOrderValue),
      },
      totalCustomers: {
        current: currentUniqueCustomers,
        previous: previousUniqueCustomers,
        percentageChange: calculatePercentageChange(currentUniqueCustomers, previousUniqueCustomers),
      },
      profitMargin: {
        current: currentProfitMargin,
        previous: previousProfitMargin,
        percentageChange: calculatePercentageChange(currentProfitMargin, previousProfitMargin),
      },
      topSellingItem: {
        name: topSellingProduct.name,
        quantitySold: topSellingProduct.quantity,
      },
      lowStockItems: {
        count: lowStockItems.length,
        items: lowStockItems.map(item => item.name),
      },
    };

    return report;
  } catch (error) {
    console.error('Error calculating report:', error);
    throw new Error(`Failed to calculate report data: ${error}`);
  }
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

// POST endpoint
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { period = 'daily', dateRange } = body;
    
    const filters: ReportFilters = {
      period,
      dateRange
    };
    
    const reportData = await calculateReport(filters);
    
    return NextResponse.json(reportData);
  } catch (error) {
    console.error('Error in POST /api/report:', error);
    return NextResponse.json(
      { error: 'Failed to fetch report data' },
      { status: 500 }
    );
  }
}