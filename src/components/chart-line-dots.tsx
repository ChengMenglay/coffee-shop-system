"use client";

import { TrendingUp } from "lucide-react";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";

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

interface ChartLineProps {
  data: { month: string; desktop: number }[];
}

const chartConfig = {
  desktop: {
    label: "Revenue",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export function ChartLineDots({ data }: ChartLineProps) {
  const chartData = data;
  const currentMonth = chartData[chartData.length - 1]?.desktop || 0;
  const previousMonth = chartData[chartData.length - 2]?.desktop || 0;
  const growth = previousMonth
    ? ((currentMonth - previousMonth) / previousMonth) * 100
    : 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Monthly Revenue</CardTitle>
        <CardDescription className="text-sm">
          Last {chartData.length} months
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-3">
        <ChartContainer config={chartConfig} className="h-36 w-full">
          <LineChart
            data={chartData}
            margin={{ left: 8, right: 8, top: 5, bottom: 5 }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 10 }}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line
              dataKey="desktop"
              type="monotone"
              stroke="var(--color-desktop)"
              strokeWidth={2}
              dot={{ fill: "var(--color-desktop)", r: 3 }}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="pt-4 flex flex-col justify-center items-start">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <TrendingUp className="h-3 w-3" />
          {growth >= 0 ? "Up" : "Down"} {Math.abs(growth).toFixed(1)}% this
          month
        </div>
        <p>Show total revenue last {chartData.length} months </p>
      </CardFooter>
    </Card>
  );
}
