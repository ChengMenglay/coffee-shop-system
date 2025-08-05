"use client";

import { TrendingUp } from "lucide-react";
import { LabelList, Pie, PieChart } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { PendingOrder } from "@/app/dashboard/(route)/order_management/page";

interface ChartPieProps {
  orders: PendingOrder[]; // Orders from Overview
}

export function ChartPieLabelList({ orders }: ChartPieProps) {
  // Calculate product sales from orders
  const calculateProductSales = () => {
    const productSales: { [key: string]: number } = {};

    orders.forEach((order) => {
      order.orderItems.forEach((item) => {
        const productName = item.product.name;
        productSales[productName] =
          (productSales[productName] || 0) + item.quantity;
      });
    });

    // Sort and get top 5 products
    const sortedProducts = Object.entries(productSales)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    // Return both sorted products and total sales
    const totalSales = Object.values(productSales).reduce((sum, quantity) => sum + quantity, 0);
    
    return { sortedProducts, totalSales };
  };

  const { sortedProducts: productSales, totalSales } = calculateProductSales();

  // Create dynamic chart config based on actual products
  const createChartConfig = (products: [string, number][]) => {
    const colors = [
      "var(--chart-1)",
      "var(--chart-2)",
      "var(--chart-3)",
      "var(--chart-4)",
      "var(--chart-5)",
    ];
    const config: Record<string, { label: string; color?: string }> = {
      sales: {
        label: "Sales",
      },
    };

    products.forEach(([productName], index) => {
      const key = productName.toLowerCase().replace(/\s+/g, "");
      config[key] = {
        label: productName,
        color: colors[index] || "var(--chart-1)",
      };
    });

    return config;
  };

  const chartConfig = createChartConfig(productSales);

  // Create chart data
  const chartData = productSales.map(([product, sales], index) => {
    const key = product.toLowerCase().replace(/\s+/g, "");
    const colors = [
      "var(--color-chart-1)",
      "var(--color-chart-2)",
      "var(--color-chart-3)",
      "var(--color-chart-4)",
      "var(--color-chart-5)",
    ];

    return {
      product: key,
      productName: product,
      sales: sales,
      fill: colors[index] || "var(--color-chart-1)",
    };
  });

  // Get top product and calculate its percentage
  const topProduct = chartData[0]?.productName || "No sales";
  const topProductSales = chartData[0]?.sales || 0;
  const growth = totalSales > 0 ? ((topProductSales / totalSales) * 100).toFixed(1) : "0";

  // Handle empty data
  if (productSales.length === 0) {
    return (
      <Card className="flex flex-col">
        <CardHeader className="items-center pb-0">
          <CardTitle>Top Selling Products</CardTitle>
          <CardDescription>{"Today's sales"}</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-0 flex items-center justify-center">
          <div className="text-muted-foreground text-sm">
            No sales data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Top Selling Products</CardTitle>
        <CardDescription>{"Today's sales breakdown"}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              content={
                <ChartTooltipContent
                  nameKey="sales"
                  hideLabel
                  formatter={(value, name, props) => [
                    `${value} sold`,
                    props.payload?.productName || name,
                  ]}
                />
              }
            />
            <Pie data={chartData} dataKey="sales">
              <LabelList
                dataKey="productName"
                className="fill-background"
                stroke="none"
                fontSize={10}
                formatter={(value: string) => {
                  // Truncate long product names
                  return value.length > 10
                    ? value.substring(0, 10) + "..."
                    : value;
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 leading-none font-medium">
          {topProduct} leading with {growth}% <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          Total items sold today: {totalSales}
        </div>
      </CardFooter>
    </Card>
  );
}