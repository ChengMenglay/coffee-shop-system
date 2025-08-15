"use client";

import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { getColumns, IngredientStockColumn } from "./columns";
import { CalendarIcon, RefreshCcw, Download } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

type IngredientStockColumnProps = {
  data: IngredientStockColumn[];
};

function IngredientStockClient({ data }: IngredientStockColumnProps) {
  const router = useRouter();
  const [filterdData, setFilterdData] = useState<IngredientStockColumn[]>(data);
  const [status, setStatus] = useState("");
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>();
  const [isExporting, setIsExporting] = useState(false);
  const columns = getColumns();

  useEffect(() => {
    setFilterdData(data);
  }, [data]);

  // Enhanced Export to CSV function
  const exportToCSV = () => {
    if (!filterdData.length) {
      alert("No data to export");
      return;
    }

    setIsExporting(true);

    try {
      // Enhanced CSV Headers
      const headers = [
        "Stock Record ID",
        "Ingredient Name",
        "Quantity Used/Expired",
        "Unit of Measurement",
        "Stock Status",
        "Usage Notes",
        "Action Taken By",
        "User Role",
        "Action Date",
        "Day of Week",
        "Month/Year",
        "Season",
      ];

      // Convert data to enhanced CSV format
      const csvData = filterdData.map((item, index) => {
        // Parse the "name" field to extract user name and role
        const nameMatch = item.name.match(/^(.+?)\s*\((.+?)\)$/);
        const userName = nameMatch ? nameMatch[1].trim() : item.name;
        const userRole = nameMatch ? nameMatch[2].trim() : "Unknown";

        // Parse date for additional analysis
        const actionDate = new Date(item.createdAt);
        const dayOfWeek = format(actionDate, "EEEE");
        const monthYear = format(actionDate, "MMMM yyyy");

        // Determine season based on month
        const month = actionDate.getMonth() + 1; // 1-12
        let season = "";
        if (month >= 3 && month <= 5) season = "Spring";
        else if (month >= 6 && month <= 8) season = "Summer";
        else if (month >= 9 && month <= 11) season = "Autumn";
        else season = "Winter";

        // Generate stock record ID
        const stockRecordId = `STK${String(index + 1).padStart(4, "0")}`;

        // Enhance quantity display
        const quantityDisplay = `${item.quantity} ${item.unit}`;

        // Enhance notes
        const enhancedNotes =
          item.note ||
          (item.status === "Expired"
            ? "Item reached expiry date"
            : "Standard usage");

        return [
          stockRecordId,
          `"${item.ingredient}"`,
          `"${quantityDisplay}"`,
          `"${item.unit}"`,
          `"${item.status}"`,
          `"${enhancedNotes}"`,
          `"${userName}"`,
          `"${userRole}"`,
          `"${item.createdAt}"`,
          `"${dayOfWeek}"`,
          `"${monthYear}"`,
          `"${season}"`,
        ];
      });

      // Calculate statistics for summary
      const totalRecords = filterdData.length;
      const usedItems = filterdData.filter(
        (item) => item.status === "Use"
      ).length;
      const expiredItems = filterdData.filter(
        (item) => item.status === "Expired"
      ).length;

      // Calculate total quantities by unit
      const quantitiesByUnit = filterdData.reduce((acc, item) => {
        const unit = item.unit;
        if (!acc[unit]) acc[unit] = 0;
        acc[unit] += item.quantity;
        return acc;
      }, {} as Record<string, number>);

      // Group by ingredients
      const ingredientStats = filterdData.reduce((acc, item) => {
        if (!acc[item.ingredient]) {
          acc[item.ingredient] = { used: 0, expired: 0, total: 0 };
        }
        acc[item.ingredient].total += item.quantity;
        if (item.status === "Use") acc[item.ingredient].used += item.quantity;
        if (item.status === "Expired")
          acc[item.ingredient].expired += item.quantity;
        return acc;
      }, {} as Record<string, { used: number; expired: number; total: number }>);

      // Add comprehensive summary section
      const summaryRows = [
        ["", "", "", "", "", "", "", "", "", "", "", ""], // Empty row
        [
          "=== STOCK USAGE SUMMARY ===",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
        ],
        [
          "Total Records:",
          totalRecords.toString(),
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
        ],
        [
          "Items Used:",
          usedItems.toString(),
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
        ],
        [
          "Items Expired:",
          expiredItems.toString(),
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
        ],
        [
          "Usage Rate:",
          `${((usedItems / totalRecords) * 100).toFixed(1)}%`,
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
        ],
        [
          "Waste Rate:",
          `${((expiredItems / totalRecords) * 100).toFixed(1)}%`,
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
        ],
        ["", "", "", "", "", "", "", "", "", "", "", ""], // Empty row
      ];

      // Add quantities by unit summary
      summaryRows.push([
        "=== QUANTITIES BY UNIT ===",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
      ]);
      Object.entries(quantitiesByUnit).forEach(([unit, quantity]) => {
        summaryRows.push([
          `Total ${unit}:`,
          quantity.toString(),
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
        ]);
      });

      // Add top ingredients summary
      summaryRows.push(["", "", "", "", "", "", "", "", "", "", "", ""]); // Empty row
      summaryRows.push([
        "=== TOP INGREDIENTS BY USAGE ===",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
      ]);
      const sortedIngredients = Object.entries(ingredientStats)
        .sort(([, a], [, b]) => b.total - a.total)
        .slice(0, 5);

      sortedIngredients.forEach(([ingredient, stats]) => {
        summaryRows.push([
          `"${ingredient}":`,
          `${stats.total} total`,
          `${stats.used} used`,
          `${stats.expired} expired`,
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
        ]);
      });

      // Add export metadata
      const metadataRows = [
        ["", "", "", "", "", "", "", "", "", "", "", ""], // Empty row
        [
          "=== EXPORT INFORMATION ===",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
        ],
        [
          "Export Date:",
          `"${format(new Date(), "dd MMMM yyyy HH:mm")}"`,
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
        ],
        [
          "Exported By:",
          '"Coffee Shop System"',
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
        ],
        [
          "Report Type:",
          '"Stock Usage Analysis"',
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
        ],
        [
          "Data Period:",
          `"${format(
            new Date(
              Math.min(
                ...filterdData.map((d) => new Date(d.createdAt).getTime())
              )
            ),
            "dd/MM/yyyy"
          )} - ${format(
            new Date(
              Math.max(
                ...filterdData.map((d) => new Date(d.createdAt).getTime())
              )
            ),
            "dd/MM/yyyy"
          )}"`,
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
        ],
      ];

      // Add filter information if filters are applied
      const filterInfo = [];
      if (status && status !== "All") {
        filterInfo.push([
          "Filter Applied - Status:",
          `"${status}"`,
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
        ]);
      }
      if (dateRange?.from && dateRange?.to) {
        filterInfo.push([
          "Filter Applied - Date Range:",
          `"${format(dateRange.from, "dd/MM/yyyy")} - ${format(
            dateRange.to,
            "dd/MM/yyyy"
          )}"`,
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
        ]);
      }

      // Combine all data
      const csvContent = [
        headers.join(","),
        ...csvData.map((row) => row.join(",")),
        ...summaryRows.map((row) => row.join(",")),
        ...metadataRows.map((row) => row.join(",")),
        ...filterInfo.map((row) => row.join(",")),
      ].join("\n");

      // Create and download file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");

      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);

        // Generate intelligent filename
        const currentDate = format(new Date(), "yyyy-MM-dd");
        let filename = `stock-usage-report-${currentDate}`;

        // Add filter info to filename
        if (status && status !== "All") {
          filename += `-${status.toLowerCase()}`;
        }

        if (dateRange?.from && dateRange?.to) {
          const fromStr = format(dateRange.from, "yyyy-MM-dd");
          const toStr = format(dateRange.to, "yyyy-MM-dd");
          filename += `-${fromStr}_to_${toStr}`;
        }

        filename += ".csv";

        link.setAttribute("download", filename);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Error exporting CSV:", error);
      alert("Error exporting data. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between">
        <Header
          title="Ingredient Stock Usage"
          subtitle="Track ingredient usage and expiry for your store."
          total={data.length}
        />
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1 my-2 w-full sm:w-auto overflow-x-auto">
          {/* Reset Button */}
          <Button
            variant={"outline"}
            size={"icon"}
            onClick={() => {
              setFilterdData(data);
              setStatus("");
              setDateRange(undefined);
            }}
            title="Reset all filters"
          >
            <RefreshCcw />
          </Button>

          {/* Enhanced Export Button */}
          <Button
            variant={"outline"}
            onClick={exportToCSV}
            disabled={isExporting || filterdData.length === 0}
            className="flex items-center gap-2 whitespace-nowrap"
            title={`Export ${filterdData.length} stock records to CSV`}
          >
            <Download className="h-4 w-4" />
            {isExporting ? "Exporting..." : "Export CSV"}
          </Button>

          {/* Date Range Picker */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "justify-start text-left font-normal truncate w-full sm:w-auto min-w-0",
                  !dateRange && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 w-4 h-4 flex-shrink-0" />
                <span className="truncate">
                  {dateRange?.from && dateRange?.to ? (
                    <>
                      {format(dateRange.from, "dd/MM/yyyy")} -{" "}
                      {format(dateRange.to, "dd/MM/yyyy")}
                    </>
                  ) : (
                    "Filter by Date Range"
                  )}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-auto p-1">
              <Calendar
                mode="range"
                selected={dateRange}
                onSelect={(range) => {
                  setDateRange(range as { from: Date; to: Date });
                  if (range && range.from && range.to) {
                    setFilterdData(
                      data.filter((item) => {
                        const ingredientDate = new Date(item.createdAt);
                        if (range.from && range.to) {
                          return (
                            ingredientDate >= range.from &&
                            ingredientDate <= range.to
                          );
                        }
                      })
                    );
                  } else {
                    setFilterdData(data);
                  }
                }}
                initialFocus
              />
              <Button
                variant={"outline"}
                onClick={() => {
                  setDateRange(undefined);
                  setFilterdData(data);
                }}
                className="w-full"
              >
                Clear
              </Button>
            </PopoverContent>
          </Popover>

          {/* Status Filter */}
          <Select
            value={status}
            onValueChange={(value) => {
              setStatus(value);
              if (value === "All") {
                setFilterdData(data);
              } else {
                setFilterdData(
                  value ? data.filter((item) => item.status === value) : data
                );
              }
            }}
          >
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder={"Select a status"} />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="All">All</SelectItem>
                <SelectItem value="Use">Use</SelectItem>
                <SelectItem value="Expired">Expired</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          {/* Stock Action Button */}
          <Button
            onClick={() => router.push("/dashboard/stock-usage/action")}
            className="w-full sm:w-auto whitespace-nowrap"
          >
            Stock Action
          </Button>
        </div>
      </div>

      {/* Enhanced Export Information */}
      {filterdData.length > 0 && (
        <div className="flex flex-col gap-2 text-sm text-muted-foreground">
          <div className="flex items-center justify-between">
            <span>
              Showing {filterdData.length} of {data.length} records
              {status && status !== "All" && (
                <span className="ml-1 text-blue-600">• Status: {status}</span>
              )}
              {dateRange?.from && dateRange?.to && (
                <span className="ml-1 text-green-600">
                  • Date: {format(dateRange.from, "dd/MM/yyyy")} -{" "}
                  {format(dateRange.to, "dd/MM/yyyy")}
                </span>
              )}
            </span>
            <span className="text-xs">
              Click Export CSV to download detailed analysis
            </span>
          </div>

          {/* Quick stats */}
          <div className="flex items-center gap-4 text-xs">
            <span className="text-green-600">
              Used: {filterdData.filter((item) => item.status === "Use").length}
            </span>
            <span className="text-red-600">
              Expired:{" "}
              {filterdData.filter((item) => item.status === "Expired").length}
            </span>
            <span className="text-blue-600">
              Waste Rate:{" "}
              {filterdData.length > 0
                ? (
                    (filterdData.filter((item) => item.status === "Expired")
                      .length /
                      filterdData.length) *
                    100
                  ).toFixed(1)
                : 0}
              %
            </span>
          </div>
        </div>
      )}

      <Separator className="my-6" />
      <DataTable columns={columns} data={filterdData} />
    </>
  );
}

export default IngredientStockClient;
