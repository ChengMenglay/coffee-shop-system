"use client";

import React, { useState, useEffect } from "react";
import { Coffee, Calendar, Filter, RefreshCw } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface ProductSalesData {
  productName: string;
  totalSales: number;
  totalQuantity: number;
  totalRevenue: number;
}

interface APIResponse {
  success: boolean;
  data: ProductSalesData[];
  error?: string;
  timestamp: string;
  fallback?: boolean;
  period?: string;
}

interface ChartBarLabelProps {
  period?: "daily" | "weekly" | "monthly" | "yearly";
  dateRange?: { from: Date; to: Date };
  isLoading?: boolean;
}

const chartConfig = {
  totalRevenue: {
    label: "Revenue ($)",
    color: "hsl(var(--chart-1))",
  },
  totalQuantity: {
    label: "Quantity",
    color: "hsl(var(--chart-2))",
  },
  label: {
    color: "hsl(var(--background))",
  },
} satisfies ChartConfig;

type Period = "daily" | "weekly" | "monthly" | "yearly";

export function ChartBarLabelCustom({
  period: propPeriod = "monthly",
  dateRange: propDateRange,
  isLoading: propIsLoading = false,
}: ChartBarLabelProps) {
  const [chartData, setChartData] = useState<ProductSalesData[]>([]);
  const [internalLoading, setInternalLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [localPeriod, setLocalPeriod] = useState<Period>("monthly");
  const [isFallback, setIsFallback] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [viewMode, setViewMode] = useState<"revenue" | "quantity">("revenue");
  const [useLocalFilters, setUseLocalFilters] = useState(false);

  // Use prop values when available, otherwise use local state
  const effectivePeriod = useLocalFilters ? localPeriod : propPeriod;
  const effectiveDateRange = useLocalFilters ? undefined : propDateRange;
  const isLoading = propIsLoading || internalLoading;

  const fetchProductSales = React.useCallback(async () => {
    setInternalLoading(true);
    setError(null);

    try {
      let url = `/api/bar-chat-label?period=${effectivePeriod}`;

      if (effectiveDateRange?.from && effectiveDateRange?.to) {
        const fromDate = effectiveDateRange.from.toISOString();
        const toDate = effectiveDateRange.to.toISOString();
        url += `&from=${encodeURIComponent(fromDate)}&to=${encodeURIComponent(
          toDate
        )}`;
      } else {
        console.log("Using default period-based range");
      }

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: APIResponse = await response.json();

      if (result.success && result.data && Array.isArray(result.data)) {
        // Limit to top 10 products for better visualization
        const topProducts = result.data.slice(0, 10);
        setChartData(topProducts);
        setIsFallback(result.fallback || false);
        setLastUpdated(new Date(result.timestamp).toLocaleTimeString());
      } else {
        throw new Error(result.error || "API returned unsuccessful response");
      }
    } catch (error) {
      console.error("Error fetching product sales data:", error);
      setError(error instanceof Error ? error.message : "An error occurred");

      // Set fallback data
      const fallbackData: ProductSalesData[] = [
        {
          productName: "Cappuccino",
          totalSales: 45,
          totalQuantity: 67,
          totalRevenue: 2010,
        },
        {
          productName: "Latte",
          totalSales: 38,
          totalQuantity: 52,
          totalRevenue: 1820,
        },
        {
          productName: "Espresso",
          totalSales: 32,
          totalQuantity: 41,
          totalRevenue: 1230,
        },
        {
          productName: "Americano",
          totalSales: 28,
          totalQuantity: 35,
          totalRevenue: 1050,
        },
        {
          productName: "Mocha",
          totalSales: 25,
          totalQuantity: 31,
          totalRevenue: 1240,
        },
        {
          productName: "Macchiato",
          totalSales: 22,
          totalQuantity: 28,
          totalRevenue: 980,
        },
      ];
      setChartData(fallbackData);
      setIsFallback(true);
    } finally {
      setInternalLoading(false);
    }
  }, [effectivePeriod, effectiveDateRange?.from, effectiveDateRange?.to]);

  useEffect(() => {
    fetchProductSales();
  }, [fetchProductSales]);



  const toggleFilterMode = () => {
    setUseLocalFilters(!useLocalFilters);
    if (!useLocalFilters) {
      // Switching to local filters
      setLocalPeriod(propPeriod);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat("en-US").format(value);
  };

  const getTotalRevenue = () => {
    return chartData.reduce((sum, item) => sum + item.totalRevenue, 0);
  };

  const getTotalQuantity = () => {
    return chartData.reduce((sum, item) => sum + item.totalQuantity, 0);
  };

  const getBestSellingProduct = () => {
    if (chartData.length === 0) return { name: "N/A", value: 0 };

    const best =
      viewMode === "revenue"
        ? chartData.reduce((max, current) =>
            current.totalRevenue > max.totalRevenue ? current : max
          )
        : chartData.reduce((max, current) =>
            current.totalQuantity > max.totalQuantity ? current : max
          );

    return {
      name: best.productName,
      value: viewMode === "revenue" ? best.totalRevenue : best.totalQuantity,
    };
  };

  const getPeriodLabel = () => {
    if (effectiveDateRange?.from && effectiveDateRange?.to) {
      return `${effectiveDateRange.from.toLocaleDateString()} - ${effectiveDateRange.to.toLocaleDateString()}`;
    }

    switch (effectivePeriod) {
      case "daily":
        return "Today";
      case "weekly":
        return "This Week";
      case "monthly":
        return "This Month";
      case "yearly":
        return "This Year";
      default:
        return "Current Period";
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-80 w-full" />
        </CardContent>
        <CardFooter>
          <Skeleton className="h-4 w-2/3" />
        </CardFooter>
      </Card>
    );
  }

  const dataKey = viewMode === "revenue" ? "totalRevenue" : "totalQuantity";
  const bestProduct = getBestSellingProduct();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Coffee className="h-5 w-5" />
              Product Sales Analysis
            </CardTitle>
            <CardDescription>
              {getPeriodLabel()} • Top performing products by {viewMode}
              {isFallback && (
                <span className="ml-2 text-xs text-orange-600">
                  (Demo Data)
                </span>
              )}
              {!useLocalFilters && (
                <span className="ml-2 text-xs text-blue-600">
                  (Synced with Report)
                </span>
              )}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleFilterMode}
              title={
                useLocalFilters
                  ? "Sync with report filters"
                  : "Use independent filters"
              }
            >
              {useLocalFilters ? "🔗" : "🔓"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchProductSales}
              disabled={isLoading}
            >
              <RefreshCw
                className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
              />
            </Button>
          </div>
        </div>

        {/* Controls - only show when using local filters */}
        {useLocalFilters && (
          <div className="flex flex-col sm:flex-row gap-3 mt-4 border-t pt-4">
            <div className="flex-1">
              <Select
                value={localPeriod}
                onValueChange={(value: Period) => setLocalPeriod(value)}
              >
                <SelectTrigger>
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Today</SelectItem>
                  <SelectItem value="weekly">This Week</SelectItem>
                  <SelectItem value="monthly">This Month</SelectItem>
                  <SelectItem value="yearly">This Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Select
                value={viewMode}
                onValueChange={(value: "revenue" | "quantity") =>
                  setViewMode(value)
                }
              >
                <SelectTrigger>
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="revenue">By Revenue</SelectItem>
                  <SelectItem value="quantity">By Quantity</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Always show view mode selector */}
        {!useLocalFilters && (
          <div className="flex justify-end mt-4">
            <Select
              value={viewMode}
              onValueChange={(value: "revenue" | "quantity") =>
                setViewMode(value)
              }
            >
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="revenue">By Revenue</SelectItem>
                <SelectItem value="quantity">By Quantity</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </CardHeader>

      <CardContent>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 text-sm">Error: {error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setError(null)}
              className="mt-2"
            >
              Dismiss
            </Button>
          </div>
        )}

        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                type="number"
                tick={{ fontSize: 12 }}
                tickFormatter={
                  viewMode === "revenue" ? formatCurrency : formatNumber
                }
              />
              <YAxis
                dataKey="productName"
                type="category"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                width={100}
                tickFormatter={(value) =>
                  value.length > 12 ? value.slice(0, 12) + "..." : value
                }
              />
              <ChartTooltip
                cursor={{ fill: "rgba(0, 0, 0, 0.1)" }}
                content={
                  <ChartTooltipContent
                    formatter={(value, name) => [
                      viewMode === "revenue"
                        ? formatCurrency(Number(value))
                        : `${formatNumber(Number(value))} units`,
                      viewMode === "revenue" ? name : ""
                    ]}
                  />
                }
              />
              <Bar
                dataKey={dataKey}
                fill={`var(--color-${
                  viewMode === "revenue" ? "totalRevenue" : "totalQuantity"
                })`}
                radius={[0, 4, 4, 0]}
              >
                <LabelList
                  dataKey="productName"
                  position="insideLeft"
                  offset={8}
                  className="fill-white text-xs font-medium"
                />
                <LabelList
                  dataKey={dataKey}
                  position="right"
                  offset={8}
                  className="fill-foreground text-xs"
                  formatter={
                    viewMode === "revenue" ? formatCurrency : formatNumber
                  }
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>

      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          <Coffee className="h-4 w-4" />
          Best seller: {bestProduct.name} (
          {viewMode === "revenue"
            ? formatCurrency(bestProduct.value)
            : `${formatNumber(bestProduct.value)} units`}
          )
        </div>
        <div className="grid grid-cols-2 gap-4 w-full text-xs text-muted-foreground">
          <div>
            <p>
              <strong>Total Revenue:</strong>{" "}
              {formatCurrency(getTotalRevenue())}
            </p>
            <p>
              <strong>Products Sold:</strong> {chartData.length}
            </p>
          </div>
          <div>
            <p>
              <strong>Total Quantity:</strong>{" "}
              {formatNumber(getTotalQuantity())} units
            </p>
            <p>
              <strong>Avg per Product:</strong>{" "}
              {formatCurrency(getTotalRevenue() / (chartData.length || 1))}
            </p>
          </div>
        </div>
        {lastUpdated && (
          <div className="text-xs text-muted-foreground border-t pt-2 w-full">
            Last updated: {lastUpdated}
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
