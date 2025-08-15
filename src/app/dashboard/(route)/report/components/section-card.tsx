import React from "react";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";

interface ReportData {
  totalSales: {
    current: number;
    previous: number;
    percentageChange: number;
  };
  totalSpend: {
    current: number;
    previous: number;
    percentageChange: number;
  };
  totalOrders: {
    current: number;
    previous: number;
    percentageChange: number;
  };
  averageOrderValue: {
    current: number;
    previous: number;
    percentageChange: number;
  };
  profitMargin: {
    current: number;
    previous: number;
    percentageChange: number;
  };
  topSellingItem: {
    name: string;
    quantitySold: number;
  };
  lowStockItems: {
    count: number;
    items: string[];
  };
}

interface SectionCardProps {
  data: ReportData | null; // Allow null
  selectedPeriod: string;
  isLoading?: boolean;
}

function SectionCard({
  data,
  selectedPeriod,
  isLoading = false,
}: SectionCardProps) {
  const getPeriodText = (period: string) => {
    switch (period) {
      case "daily":
        return "from yesterday";
      case "weekly":
        return "from last week";
      case "monthly":
        return "from last month";
      case "yearly":
        return "from last year";
      default:
        return "from previous period";
    }
  };

  if (isLoading || !data) {
    return (
      <div className="grid lg:grid-cols-4 grid-cols-2 gap-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <Card key={index} className="@container/card animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-4 grid-cols-2 gap-4">
      {/* Total Sales in USD */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>{"Total Sales (USD)"}</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            ${data.totalSales.current.toLocaleString()}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {data.totalSales.percentageChange > 0 ? (
                <IconTrendingUp />
              ) : (
                <IconTrendingDown />
              )}
              {data.totalSales.percentageChange > 0 ? "+" : ""}
              {data.totalSales.percentageChange.toFixed(1)}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {data.totalSales.percentageChange > 0 ? "Up" : "Down"}{" "}
            {getPeriodText(selectedPeriod)}{" "}
            {data.totalSales.percentageChange > 0 ? (
              <IconTrendingUp className="size-4" />
            ) : (
              <IconTrendingDown className="size-4" />
            )}
          </div>
        </CardFooter>
      </Card>

      {/* Total Sales in Riels */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>{"Total Sales (Riels)"}</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            ៛{(data.totalSales.current * 4100).toLocaleString()}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {data.totalSales.percentageChange > 0 ? (
                <IconTrendingUp />
              ) : (
                <IconTrendingDown />
              )}
              {data.totalSales.percentageChange > 0 ? "+" : ""}
              {data.totalSales.percentageChange.toFixed(1)}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {data.totalSales.percentageChange > 0 ? "Up" : "Down"}{" "}
            {getPeriodText(selectedPeriod)}{" "}
            {data.totalSales.percentageChange > 0 ? (
              <IconTrendingUp className="size-4" />
            ) : (
              <IconTrendingDown className="size-4" />
            )}
          </div>
        </CardFooter>
      </Card>
      {/* Total Spend */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>{"Total Spend"}</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            ${data.totalSpend.current.toLocaleString()}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {data.totalSpend.percentageChange > 0 ? (
                <IconTrendingUp />
              ) : (
                <IconTrendingDown />
              )}
              {data.totalSpend.percentageChange > 0 ? "+" : ""}
              {data.totalSpend.percentageChange.toFixed(1)}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {data.totalSpend.percentageChange > 0 ? "Up" : "Down"}{" "}
            {getPeriodText(selectedPeriod)}{" "}
            {data.totalSpend.percentageChange > 0 ? (
              <IconTrendingUp className="size-4" />
            ) : (
              <IconTrendingDown className="size-4" />
            )}
          </div>
        </CardFooter>
      </Card>

      {/* Total Orders */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>{"Total Orders"}</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {data.totalOrders.current.toLocaleString()}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {data.totalOrders.percentageChange > 0 ? (
                <IconTrendingUp />
              ) : (
                <IconTrendingDown />
              )}
              {data.totalOrders.percentageChange > 0 ? "+" : ""}
              {data.totalOrders.percentageChange.toFixed(1)}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {data.totalOrders.percentageChange > 0 ? "Up" : "Down"}{" "}
            {getPeriodText(selectedPeriod)}{" "}
            {data.totalOrders.percentageChange > 0 ? (
              <IconTrendingUp className="size-4" />
            ) : (
              <IconTrendingDown className="size-4" />
            )}
          </div>
        </CardFooter>
      </Card>

      {/* Average Order Value */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>{"Average Order Value"}</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            ${data.averageOrderValue.current.toFixed(2)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {data.averageOrderValue.percentageChange > 0 ? (
                <IconTrendingUp />
              ) : (
                <IconTrendingDown />
              )}
              {data.averageOrderValue.percentageChange > 0 ? "+" : ""}
              {data.averageOrderValue.percentageChange.toFixed(1)}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {data.averageOrderValue.percentageChange > 0 ? "Up" : "Down"}{" "}
            {getPeriodText(selectedPeriod)}{" "}
            {data.averageOrderValue.percentageChange > 0 ? (
              <IconTrendingUp className="size-4" />
            ) : (
              <IconTrendingDown className="size-4" />
            )}
          </div>
        </CardFooter>
      </Card>
      {/* Profit Margin */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>{"Profit Margin"}</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {data.profitMargin.current.toFixed(1)}%
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {data.profitMargin.percentageChange > 0 ? (
                <IconTrendingUp />
              ) : (
                <IconTrendingDown />
              )}
              {data.profitMargin.percentageChange > 0 ? "+" : ""}
              {data.profitMargin.percentageChange.toFixed(1)}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {data.profitMargin.percentageChange > 0 ? "Up" : "Down"}{" "}
            {getPeriodText(selectedPeriod)}{" "}
            {data.profitMargin.percentageChange > 0 ? (
              <IconTrendingUp className="size-4" />
            ) : (
              <IconTrendingDown className="size-4" />
            )}
          </div>
        </CardFooter>
      </Card>

      {/* Top Selling Item */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>{"Top Selling Item"}</CardDescription>
          <CardTitle className="text-xl font-semibold @[250px]/card:text-2xl">
            {data.topSellingItem.name || "No data"}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {data.topSellingItem.quantitySold} sold
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Most popular this{" "}
            {selectedPeriod === "daily"
              ? "day"
              : selectedPeriod.replace("ly", "")}
          </div>
        </CardFooter>
      </Card>

      {/* Inventory Alert */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>{"Low Stock Items"}</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {data.lowStockItems.count}
          </CardTitle>
          <CardAction>
            <Badge
              variant={data.lowStockItems.count > 0 ? "destructive" : "outline"}
            >
              {data.lowStockItems.count > 0 ? "Alert" : "Good"}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div
            className={`line-clamp-1 flex gap-2 font-medium ${
              data.lowStockItems.count > 0 ? "text-destructive" : ""
            }`}
          >
            {data.lowStockItems.count > 0
              ? "Requires immediate attention"
              : "All items in stock"}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

export default SectionCard;
