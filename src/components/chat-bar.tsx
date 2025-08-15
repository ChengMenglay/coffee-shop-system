"use client";

import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Search,
  Calendar,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  ResponsiveContainer,
  Legend,
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
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface MonthlyData {
  month: string;
  currentYear: number;
  previousYear: number;
  currentYearLabel: string;
  previousYearLabel: string;
}

interface APIResponse {
  success: boolean;
  data: MonthlyData[];
  error?: string;
  timestamp: string;
  fallback?: boolean;
  customRange?: {
    startYear: number;
    endYear: number;
  };
}

export function ChartBar() {
  const [chartData, setChartData] = useState<MonthlyData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startYear, setStartYear] = useState<string>("");
  const [endYear, setEndYear] = useState<string>("");
  const [isFallback, setIsFallback] = useState(false);
  const [isCustomRange, setIsCustomRange] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [chartConfig, setChartConfig] = useState<ChartConfig>({
    currentYear: {
      label: "2025",
      color: "hsl(var(--chart-1))",
    },
    previousYear: {
      label: "2024",
      color: "hsl(var(--chart-2))",
    },
  });

  useEffect(() => {
    // Load default data on component mount
    fetchChartData();
  }, []);

  const fetchChartData = async (
    customStartYear?: string,
    customEndYear?: string
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      let response;
      // Use POST if custom years are provided
      if (customStartYear && customEndYear) {
        response = await fetch("/api/bar-chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            startYear: customStartYear,
            endYear: customEndYear,
          }),
        });
      } else {
        // Use GET for default behavior
        response = await fetch("/api/bar-chat");
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: APIResponse = await response.json();

      if (result.success && result.data && Array.isArray(result.data)) {
        setChartData(result.data);
        setIsFallback(result.fallback || false);
        setIsCustomRange(!!result.customRange);
        setLastUpdated(new Date(result.timestamp).toLocaleTimeString());

        // Update chart config with actual years
        if (result.data.length > 0) {
          setChartConfig((prev) => ({
            ...prev,
            currentYear: {
              ...prev.currentYear,
              label: result.data[0].currentYearLabel,
            },
            previousYear: {
              ...prev.previousYear,
              label: result.data[0].previousYearLabel,
            },
          }));
        }
      } else {
        throw new Error(result.error || "API returned unsuccessful response");
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");

      // Set fallback data if API completely fails
      const currentYear = new Date().getFullYear();
      const previousYear = currentYear - 1;
      const fallbackData: MonthlyData[] = [
        {
          month: "Jan",
          currentYear: 12500,
          previousYear: 11000,
          currentYearLabel: currentYear.toString(),
          previousYearLabel: previousYear.toString(),
        },
        {
          month: "Feb",
          currentYear: 13200,
          previousYear: 10800,
          currentYearLabel: currentYear.toString(),
          previousYearLabel: previousYear.toString(),
        },
        {
          month: "Mar",
          currentYear: 14100,
          previousYear: 12300,
          currentYearLabel: currentYear.toString(),
          previousYearLabel: previousYear.toString(),
        },
        {
          month: "Apr",
          currentYear: 13800,
          previousYear: 11500,
          currentYearLabel: currentYear.toString(),
          previousYearLabel: previousYear.toString(),
        },
        {
          month: "May",
          currentYear: 15200,
          previousYear: 13100,
          currentYearLabel: currentYear.toString(),
          previousYearLabel: previousYear.toString(),
        },
        {
          month: "Jun",
          currentYear: 16500,
          previousYear: 14200,
          currentYearLabel: currentYear.toString(),
          previousYearLabel: previousYear.toString(),
        },
        {
          month: "Jul",
          currentYear: 17800,
          previousYear: 15600,
          currentYearLabel: currentYear.toString(),
          previousYearLabel: previousYear.toString(),
        },
        {
          month: "Aug",
          currentYear: 16900,
          previousYear: 14800,
          currentYearLabel: currentYear.toString(),
          previousYearLabel: previousYear.toString(),
        },
        {
          month: "Sep",
          currentYear: 15400,
          previousYear: 13900,
          currentYearLabel: currentYear.toString(),
          previousYearLabel: previousYear.toString(),
        },
        {
          month: "Oct",
          currentYear: 14700,
          previousYear: 12700,
          currentYearLabel: currentYear.toString(),
          previousYearLabel: previousYear.toString(),
        },
        {
          month: "Nov",
          currentYear: 13600,
          previousYear: 11400,
          currentYearLabel: currentYear.toString(),
          previousYearLabel: previousYear.toString(),
        },
        {
          month: "Dec",
          currentYear: 18200,
          previousYear: 16800,
          currentYearLabel: currentYear.toString(),
          previousYearLabel: previousYear.toString(),
        },
      ];
      setChartData(fallbackData);
      setIsFallback(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomSearch = () => {
    if (!startYear || !endYear) {
      setError("Please enter both start and end years");
      return;
    }

    const start = parseInt(startYear);
    const end = parseInt(endYear);

    if (isNaN(start) || isNaN(end)) {
      setError("Please enter valid year numbers");
      return;
    }

    if (start >= end) {
      setError("Start year must be less than end year");
      return;
    }

    if (start < 1900 || end > 2100) {
      setError("Years must be between 1900 and 2100");
      return;
    }

    fetchChartData(startYear, endYear);
  };

  const handleReset = () => {
    setStartYear("");
    setEndYear("");
    setIsCustomRange(false);
    setError(null);
    fetchChartData(); // Fetch default data
  };

  const calculateYearOverYearGrowth = () => {
    if (chartData.length === 0) return 0;

    const currentYearTotal = chartData.reduce(
      (sum, month) => sum + (month.currentYear || 0),
      0
    );
    const previousYearTotal = chartData.reduce(
      (sum, month) => sum + (month.previousYear || 0),
      0
    );

    if (previousYearTotal === 0) return currentYearTotal > 0 ? 100 : 0;
    return ((currentYearTotal - previousYearTotal) / previousYearTotal) * 100;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getBestMonth = () => {
    if (chartData.length === 0) return { month: "N/A", value: 0 };

    const best = chartData.reduce((max, current) =>
      (current.currentYear || 0) > (max.currentYear || 0) ? current : max
    );
    return { month: best.month, value: best.currentYear || 0 };
  };

  const getWorstMonth = () => {
    if (chartData.length === 0) return { month: "N/A", value: 0 };

    const worst = chartData.reduce((min, current) =>
      (current.currentYear || 0) < (min.currentYear || 0) ? current : min
    );
    return { month: worst.month, value: worst.currentYear || 0 };
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

  const growth = calculateYearOverYearGrowth();
  const currentYear =
    chartData[0]?.currentYearLabel || new Date().getFullYear().toString();
  const previousYear =
    chartData[0]?.previousYearLabel ||
    (new Date().getFullYear() - 1).toString();
  const bestMonth = getBestMonth();
  const worstMonth = getWorstMonth();
  const currentYearTotal = chartData.reduce(
    (sum, month) => sum + (month.currentYear || 0),
    0
  );
  const previousYearTotal = chartData.reduce(
    (sum, month) => sum + (month.previousYear || 0),
    0
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Monthly Sales Comparison
            </CardTitle>
            <CardDescription>
              {currentYear} vs {previousYear} •{" "}
              <span
                className={`font-semibold ${
                  growth >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {growth >= 0 ? "+" : ""}
                {growth.toFixed(1)}% YoY Growth
              </span>
              {isFallback && (
                <span className="ml-2 text-xs text-orange-600">
                  (Demo Data)
                </span>
              )}
              {isCustomRange && (
                <span className="ml-2 text-xs text-blue-600">
                  (Custom Range)
                </span>
              )}
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            disabled={isLoading}
            title="Reset to default view"
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
          </Button>
        </div>

        {/* Year Input Controls */}
        <div className="border-t pt-4 mt-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Label htmlFor="startYear" className="text-xs font-medium">
                Start Year (Previous)
              </Label>
              <Input
                id="startYear"
                type="number"
                placeholder="e.g., 2024"
                value={startYear}
                onChange={(e) => setStartYear(e.target.value)}
                min="2000"
                max="2100"
                disabled={isLoading}
                className="mt-1"
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="endYear" className="text-xs font-medium">
                End Year (Current)
              </Label>
              <Input
                id="endYear"
                type="number"
                placeholder="e.g., 2025"
                value={endYear}
                onChange={(e) => setEndYear(e.target.value)}
                min="2000"
                max="2100"
                disabled={isLoading}
                className="mt-1"
              />
            </div>
            <div className="flex items-end gap-2">
              <Button
                onClick={handleCustomSearch}
                disabled={isLoading || !startYear || !endYear}
                size="sm"
                className="min-w-[80px]"
              >
                <Search className="h-4 w-4 mr-1" />
                Filter
              </Button>
            </div>
          </div>
          {(startYear || endYear) && (
            <div className="text-xs text-muted-foreground mt-2">
              Will compare {endYear || "current year"} vs{" "}
              {startYear || "previous year"} monthly data
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 text-sm">Error: {error}</p>
            <div className="flex gap-2 mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setError(null)}
              >
                Dismiss
              </Button>
              <Button variant="outline" size="sm" onClick={handleReset}>
                Reset
              </Button>
            </div>
          </div>
        )}

        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              barCategoryGap="20%"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <ChartTooltip
                cursor={{ fill: "rgba(0, 0, 0, 0.1)" }}
                content={
                  <ChartTooltipContent
                    formatter={(value, name) => [
                      formatCurrency(Number(value)) + " - ",
                      chartConfig[name as keyof typeof chartConfig]?.label ||
                        name,
                    ]}
                  />
                }
              />
              <Legend
                wrapperStyle={{ paddingTop: "20px" }}
                formatter={(value) =>
                  chartConfig[value as keyof typeof chartConfig]?.label || value
                }
              />
              <Bar
                dataKey="previousYear"
                fill="var(--color-previousYear)"
                radius={[0, 0, 4, 4]}
                name="previousYear"
              />
              <Bar
                dataKey="currentYear"
                fill="var(--color-currentYear)"
                radius={[4, 4, 0, 0]}
                name="currentYear"
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>

      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          {growth >= 0 ? (
            <>
              Trending up by {Math.abs(growth).toFixed(1)}% this year
              <TrendingUp className="h-4 w-4 text-green-600" />
            </>
          ) : (
            <>
              Trending down by {Math.abs(growth).toFixed(1)}% this year
              <TrendingDown className="h-4 w-4 text-red-600" />
            </>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4 w-full text-xs text-muted-foreground">
          <div>
            <p>
              <strong>Best Month:</strong> {bestMonth.month} (
              {formatCurrency(bestMonth.value)})
            </p>
            <p>
              <strong>{currentYear} Total:</strong>{" "}
              {formatCurrency(currentYearTotal)}
            </p>
          </div>
          <div>
            <p>
              <strong>Worst Month:</strong> {worstMonth.month} (
              {formatCurrency(worstMonth.value)})
            </p>
            <p>
              <strong>{previousYear} Total:</strong>{" "}
              {formatCurrency(previousYearTotal)}
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
