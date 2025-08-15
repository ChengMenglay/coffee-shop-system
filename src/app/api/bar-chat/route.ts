import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

interface MonthlyData {
  month: string;
  currentYear: number;
  previousYear: number;
  currentYearLabel: string;
  previousYearLabel: string;
}

// FIXED: Function name and parameter logic
async function getMonthlyChartData(startYear?: number, endYear?: number): Promise<MonthlyData[]> {
  // FIXED: Correct parameter assignment
  const currentYear = endYear || new Date().getFullYear();
  const previousYear = startYear || (currentYear - 1);
  
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  try {
    const currentYearData = await Promise.all(
      months.map(async (month, index) => {  // FIXED: 'months' to 'month'
        const monthStart = new Date(currentYear, index, 1);
        monthStart.setHours(0, 0, 0, 0);
        const monthEnd = new Date(currentYear, index + 1, 1);
        monthEnd.setHours(0, 0, 0, 0);
        const orders = await prisma.order.findMany({  // FIXED: 'order' to 'orders'
          where: {
            orderStatus: "Completed",
            paymentStatus: true,
            createdAt: {
              gte: monthStart,
              lt: monthEnd
            },
          },
          select: {
            total: true,
            createdAt: true
          }
        });
        
        const total = orders.reduce((sum, order) => sum + Number(order.total), 0);
        
        return total;
      })
    );

    // Get data for previous year
    const previousYearData = await Promise.all(
      months.map(async (month, index) => {
        const monthStart = new Date(previousYear, index, 1);
        monthStart.setHours(0, 0, 0, 0);
        
        const monthEnd = new Date(previousYear, index + 1, 1);
        monthEnd.setHours(0, 0, 0, 0);
        
        const orders = await prisma.order.findMany({
          where: {
            orderStatus: "Completed",
            paymentStatus: true,
            createdAt: {
              gte: monthStart,
              lt: monthEnd
            }
          },
          select: {
            total: true,
            createdAt: true
          }
        });
        
        const total = orders.reduce((sum, order) => sum + Number(order.total), 0);
        return total;
      })
    );

    const chartData: MonthlyData[] = months.map((month, index) => ({
      month,
      currentYear: currentYearData[index],
      previousYear: previousYearData[index],
      currentYearLabel: currentYear.toString(),
      previousYearLabel: previousYear.toString()
    }));
    return chartData;
  } catch (error) {
    console.error('Error fetching chart data:', error);
    throw error;
  }
}

// ADDED: GET endpoint for default behavior
export async function GET() {
  try {
    const chartData = await getMonthlyChartData();
    
    return NextResponse.json({
      success: true,
      data: chartData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in GET chart data API:', error);
    
    // Return fallback mock data
    const currentYear = new Date().getFullYear();
    const previousYear = currentYear - 1;
    
    const mockData: MonthlyData[] = [
      { month: 'Jan', currentYear: 12500, previousYear: 11000, currentYearLabel: currentYear.toString(), previousYearLabel: previousYear.toString() },
      { month: 'Feb', currentYear: 13200, previousYear: 10800, currentYearLabel: currentYear.toString(), previousYearLabel: previousYear.toString() },
      { month: 'Mar', currentYear: 14100, previousYear: 12300, currentYearLabel: currentYear.toString(), previousYearLabel: previousYear.toString() },
      { month: 'Apr', currentYear: 13800, previousYear: 11500, currentYearLabel: currentYear.toString(), previousYearLabel: previousYear.toString() },
      { month: 'May', currentYear: 15200, previousYear: 13100, currentYearLabel: currentYear.toString(), previousYearLabel: previousYear.toString() },
      { month: 'Jun', currentYear: 16500, previousYear: 14200, currentYearLabel: currentYear.toString(), previousYearLabel: previousYear.toString() },
      { month: 'Jul', currentYear: 17800, previousYear: 15600, currentYearLabel: currentYear.toString(), previousYearLabel: previousYear.toString() },
      { month: 'Aug', currentYear: 16900, previousYear: 14800, currentYearLabel: currentYear.toString(), previousYearLabel: previousYear.toString() },
      { month: 'Sep', currentYear: 15400, previousYear: 13900, currentYearLabel: currentYear.toString(), previousYearLabel: previousYear.toString() },
      { month: 'Oct', currentYear: 14700, previousYear: 12700, currentYearLabel: currentYear.toString(), previousYearLabel: previousYear.toString() },
      { month: 'Nov', currentYear: 13600, previousYear: 11400, currentYearLabel: currentYear.toString(), previousYearLabel: previousYear.toString() },
      { month: 'Dec', currentYear: 18200, previousYear: 16800, currentYearLabel: currentYear.toString(), previousYearLabel: previousYear.toString() },
    ];

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch chart data',
      data: mockData,
      timestamp: new Date().toISOString(),
      fallback: true
    });
  }
}

// FIXED: POST endpoint
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { startYear, endYear } = body;
    
    // Validate years
    if (startYear && endYear) {
      const start = parseInt(startYear);
      const end = parseInt(endYear);
      
      // Basic validation
      if (isNaN(start) || isNaN(end)) {
        return NextResponse.json({
          success: false,
          error: 'Invalid year format. Please provide valid numbers.',
          timestamp: new Date().toISOString()
        }, { status: 400 });
      }
      
      if (start < 1900 || end < 1900 || start > 2100 || end > 2100) {
        return NextResponse.json({
          success: false,
          error: 'Years must be between 1900 and 2100.',
          timestamp: new Date().toISOString()
        }, { status: 400 });
      }
      
      if (start >= end) {
        return NextResponse.json({
          success: false,
          error: 'Start year must be less than end year.',
          timestamp: new Date().toISOString()
        }, { status: 400 });
      }
      
      // Fetch data for custom year range
      const chartData = await getMonthlyChartData(start, end);
      
      return NextResponse.json({
        success: true,
        data: chartData,
        customRange: { startYear: start, endYear: end },
        timestamp: new Date().toISOString()
      });
    }

    // Default behavior
    const chartData = await getMonthlyChartData();
    return NextResponse.json({
      success: true,
      data: chartData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in POST chart data API:', error);
    
    // ADDED: Return fallback data in error
    const currentYear = new Date().getFullYear();
    const previousYear = currentYear - 1;
    
    const mockData: MonthlyData[] = [
      { month: 'Jan', currentYear: 8500, previousYear: 7200, currentYearLabel: currentYear.toString(), previousYearLabel: previousYear.toString() },
      { month: 'Feb', currentYear: 9200, previousYear: 8100, currentYearLabel: currentYear.toString(), previousYearLabel: previousYear.toString() },
      { month: 'Mar', currentYear: 10100, previousYear: 9300, currentYearLabel: currentYear.toString(), previousYearLabel: previousYear.toString() },
      { month: 'Apr', currentYear: 11800, previousYear: 10500, currentYearLabel: currentYear.toString(), previousYearLabel: previousYear.toString() },
      { month: 'May', currentYear: 13200, previousYear: 11100, currentYearLabel: currentYear.toString(), previousYearLabel: previousYear.toString() },
      { month: 'Jun', currentYear: 15500, previousYear: 13200, currentYearLabel: currentYear.toString(), previousYearLabel: previousYear.toString() },
      { month: 'Jul', currentYear: 16800, previousYear: 14600, currentYearLabel: currentYear.toString(), previousYearLabel: previousYear.toString() },
      { month: 'Aug', currentYear: 15900, previousYear: 13800, currentYearLabel: currentYear.toString(), previousYearLabel: previousYear.toString() },
      { month: 'Sep', currentYear: 14400, previousYear: 12900, currentYearLabel: currentYear.toString(), previousYearLabel: previousYear.toString() },
      { month: 'Oct', currentYear: 13700, previousYear: 11700, currentYearLabel: currentYear.toString(), previousYearLabel: previousYear.toString() },
      { month: 'Nov', currentYear: 12600, previousYear: 10400, currentYearLabel: currentYear.toString(), previousYearLabel: previousYear.toString() },
      { month: 'Dec', currentYear: 17200, previousYear: 15800, currentYearLabel: currentYear.toString(), previousYearLabel: previousYear.toString() },
    ];

    return NextResponse.json({
      success: false,
      error: 'Failed to fetch chart data',
      data: mockData,
      timestamp: new Date().toISOString(),
      fallback: true
    }, { status: 500 });
  }
}
