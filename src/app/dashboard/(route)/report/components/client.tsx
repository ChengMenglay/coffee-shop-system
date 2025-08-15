"use client";
import Header from "@/components/Header";
import React, { useState, useEffect, useCallback } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { CalendarIcon, RefreshCcw, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import SectionCard from "./section-card";
import { Separator } from "@/components/ui/separator";
import { ChartBar } from "@/components/chat-bar";
import { ChartBarLabelCustom } from "@/components/chart-bar-label";

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

function ReportClient() {
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>();
  const [selectedDate, setSelectedDate] = useState<string>("daily");
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch report data based on filters
  const fetchReportData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          period: selectedDate,
          dateRange: dateRange
            ? {
                from: dateRange.from.toISOString(),
                to: dateRange.to.toISOString(),
              }
            : undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch report data");
      }

      const data = await response.json();
      setReportData(data);
    } catch (error) {
      console.error("Error fetching report data:", error);
      setError(error instanceof Error ? error.message : "An error occurred");
      setReportData((prevData) => {
        if (!prevData) {
          return {
            totalSales: { current: 0, previous: 0, percentageChange: 0 },
            totalSpend: { current: 0, previous: 0, percentageChange: 0 },
            totalOrders: { current: 0, previous: 0, percentageChange: 0 },
            averageOrderValue: { current: 0, previous: 0, percentageChange: 0 },
            profitMargin: { current: 0, previous: 0, percentageChange: 0 },
            topSellingItem: { name: "No data", quantitySold: 0 },
            lowStockItems: { count: 0, items: [] },
          };
        }
        return prevData;
      });
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate, dateRange]);

  // Fetch data when filters change
  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  const handleExport = async () => {
    if (!reportData) return;

    try {
      // Create CSV content
      const csvContent = generateCSV(reportData, selectedDate, dateRange);

      // Download CSV file
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `report-${selectedDate}-${
        new Date().toISOString().split("T")[0]
      }.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting report:", error);
    }
  };

  const generateCSV = (
    data: ReportData,
    period: string,
    dateRange?: { from: Date; to: Date }
  ) => {
    const headers = ["Metric", "Current", "Previous", "Change %"];
    const rows = [
      [
        "Total Sales",
        data.totalSales.current.toString(),
        data.totalSales.previous.toString(),
        data.totalSales.percentageChange.toFixed(2),
      ],
      [
        "Total Spend",
        data.totalSpend.current.toString(),
        data.totalSpend.previous.toString(),
        data.totalSpend.percentageChange.toFixed(2),
      ],
      [
        "Total Orders",
        data.totalOrders.current.toString(),
        data.totalOrders.previous.toString(),
        data.totalOrders.percentageChange.toFixed(2),
      ],
      [
        "Average Order Value",
        data.averageOrderValue.current.toFixed(2),
        data.averageOrderValue.previous.toFixed(2),
        data.averageOrderValue.percentageChange.toFixed(2),
      ],
      [
        "Profit Margin %",
        data.profitMargin.current.toFixed(2),
        data.profitMargin.previous.toFixed(2),
        data.profitMargin.percentageChange.toFixed(2),
      ],
      [
        "Top Selling Item",
        data.topSellingItem.name,
        data.topSellingItem.quantitySold.toString(),
        "",
      ],
      [
        "Low Stock Items",
        data.lowStockItems.count.toString(),
        data.lowStockItems.items.join("; "),
        "",
      ],
    ];

    const csvContent = [headers, ...rows]
      .map((row) => row.map((field) => `"${field}"`).join(","))
      .join("\n");

    return `Report Period: ${period}\nDate Range: ${
      dateRange
        ? `${dateRange.from.toDateString()} - ${dateRange.to.toDateString()}`
        : "Default"
    }\nGenerated: ${new Date().toISOString()}\n\n${csvContent}`;
  };

  const handleRefresh = () => {
    setSelectedDate("daily");
    setDateRange(undefined);
    setError(null);
    fetchReportData();
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2">
        <Header
          title="Report Summary"
          subtitle="View and analyze your report data."
        />
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1 my-2 w-full sm:w-auto overflow-x-auto">
          <Button variant={"outline"} size={"icon"} onClick={handleRefresh}>
            <RefreshCcw />
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  " justify-start text-left font-normal",
                  !dateRange && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 w-4 h-4" />
                {dateRange?.from && dateRange?.to ? (
                  <>
                    {format(dateRange.from, "dd/MM/yyyy")} -{" "}
                    {format(dateRange.to, "dd/MM/yyyy")}
                  </>
                ) : (
                  <span className=" truncate">Filter by Date Range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-auto p-1">
              <Calendar
                mode="range"
                selected={dateRange}
                onSelect={(range) => {
                  setDateRange(range as { from: Date; to: Date });
                }}
                initialFocus
              />
              <Button
                variant={"outline"}
                onClick={() => setDateRange(undefined)}
                className="w-full"
              >
                Clear
              </Button>
            </PopoverContent>
          </Popover>
          <Select
            value={selectedDate}
            onValueChange={(value) => {
              setSelectedDate(value);
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={"Select a period"} />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <Button onClick={handleExport} disabled={!reportData}>
            <Upload />
            Export
          </Button>
        </div>
      </div>
      <Separator />

      {error && (
        <div className="my-2 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">Error: {error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchReportData}
            className="mt-2"
          >
            Retry
          </Button>
        </div>
      )}

      <div className="my-2">
        <SectionCard
          data={reportData}
          selectedPeriod={selectedDate}
          isLoading={isLoading}
        />
      </div>
      <div className="grid lg:grid-cols-2 grid-cols-1 gap-4 mt-6">
        <ChartBar />
        <ChartBarLabelCustom
          period={selectedDate as "daily" | "weekly" | "monthly" | "yearly"}
          dateRange={dateRange}
          isLoading={isLoading}
        />
      </div>
    </>
  );
}

export default ReportClient;
