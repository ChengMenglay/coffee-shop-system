"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { RefreshCcw, Trash2, Clock, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { toast } from "sonner";
import { SaleReportData } from "types";

interface DayCloseTableProps {
  data: SaleReportData[];
  isLoading: boolean;
  onRefresh: () => void;
  onDelete: (id: string) => void;
}

export default function DayCloseTable({
  data,
  isLoading,
  onRefresh,
  onDelete,
}: DayCloseTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Helper function to safely format currency
  const formatCurrency = (value: number, decimals: number = 2): string => {
    const num = Number(value) || 0;
    return num.toFixed(decimals);
  };

  // Helper function to parse and format hourly breakdown
  const parseHourlyBreakdown = (hourlyBreakdown: string | null) => {
    if (!hourlyBreakdown) return null;
    try {
      const data = JSON.parse(hourlyBreakdown);
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
      return null;
    } catch (error) {
      console.error("Error parsing hourly breakdown:", error);
      return null;
    }
  };

  // Helper function to get peak hours and summary
  const getHourlyBreakdownSummary = (hourlyBreakdown: string | null) => {
    const data = parseHourlyBreakdown(hourlyBreakdown);
    if (!data || data.length === 0)
      return { peakHour: "No data", totalHours: 0, peakSales: 0 };

    // Handle the correct data structure: { hour: "07:00", orders: number, revenue: number }
    const validData = data
      .map((entry) => {
        // Use the correct property names from the API
        const revenue =
          entry?.revenue ||
          entry?.sales ||
          entry?.totalSales ||
          entry?.amount ||
          0;
        const orders =
          entry?.orders ||
          entry?.totalOrders ||
          entry?.orderCount ||
          entry?.count ||
          0;
        const hourStr = entry?.hour || entry?.time || "0:00";

        // Extract hour number from "HH:MM" format
        const hour = parseInt(hourStr.split(":")[0]) || 0;

        return {
          hour: hour,
          sales: Number(revenue), // Map revenue to sales for consistency
          orders: Number(orders),
          originalEntry: entry,
        };
      })
      .filter(
        (entry) => !isNaN(entry.hour) && entry.hour >= 0 && entry.hour <= 23
      );

    if (validData.length === 0)
      return { peakHour: "No data", totalHours: 0, peakSales: 0 };

    const peakEntry = validData.reduce(
      (max, entry) => (entry.sales > max.sales ? entry : max),
      validData[0]
    );

    return {
      peakHour: `${peakEntry.hour.toString().padStart(2, "0")}:00`,
      totalHours: validData.length,
      peakSales: Number(peakEntry.sales) || 0,
      totalSales: validData.reduce(
        (sum, entry) => sum + (Number(entry.sales) || 0),
        0
      ),
    };
  };

  const handleDelete = useCallback(
    async (id: string) => {
      setDeletingId(id);
      try {
        const response = await fetch(`/api/day-close/${id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Failed to delete day close record");
        }

        toast.success("Day close record deleted successfully");
        onDelete(id);
      } catch (error) {
        console.error("Error deleting day close record:", error);
        toast.error("Failed to delete day close record");
      } finally {
        setDeletingId(null);
      }
    },
    [onDelete]
  );

  return (
    <div className="my-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Day Close Records</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isLoading}
        >
          <RefreshCcw
            className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")}
          />
          Refresh
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Hourly Breakdown</TableHead>
              <TableHead className="text-right">Total Sales</TableHead>
              <TableHead className="text-right">Orders</TableHead>
              <TableHead className="text-right">Customers</TableHead>
              <TableHead className="text-right sm:table-cell hidden">
                Cash
              </TableHead>
              <TableHead className="text-right sm:table-cell hidden">
                ABA
              </TableHead>
              <TableHead className="text-right sm:table-cell hidden">
                Card
              </TableHead>
              <TableHead className="w-[100px] sm:table-cell hidden">
                Closed By
              </TableHead>
              <TableHead className="w-[120px]">Closed At</TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8">
                  <div className="flex items-center justify-center">
                    <RefreshCcw className="h-4 w-4 animate-spin mr-2" />
                    Loading day close records...
                  </div>
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={10}
                  className="text-center py-8 text-muted-foreground"
                >
                  No day close records found
                </TableCell>
              </TableRow>
            ) : (
              data.map((dayClose) => {
                const hourlyBreakdown = parseHourlyBreakdown(
                  dayClose.hourlyBreakdown
                );
                const summary = getHourlyBreakdownSummary(
                  dayClose.hourlyBreakdown
                );

                // Temporary debug log to see actual data
                if (hourlyBreakdown && hourlyBreakdown.length > 0) {
                  console.log("Sample hourly data for debugging:", {
                    date: dayClose.date,
                    firstEntry: hourlyBreakdown[0],
                    summary: summary,
                  });
                }

                return (
                  <TableRow key={dayClose.id}>
                    <TableCell className="font-medium">
                      {hourlyBreakdown ? (
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="ghost"
                              className="h-auto p-2 justify-start text-left"
                            >
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <BarChart3 className="h-4 w-4 text-blue-500" />
                                  <span className="font-medium">
                                    {format(new Date(dayClose.date), "MMM dd")}
                                  </span>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Peak: {summary.peakHour} ($
                                  {formatCurrency(summary.peakSales)})
                                </div>
                                <Badge variant="secondary" className="text-xs">
                                  {summary.totalHours} hours active
                                </Badge>
                              </div>
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent align="start" className="w-80">
                            <div className="space-y-3">
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                <h4 className="font-semibold">
                                  Hourly Breakdown -{" "}
                                  {format(
                                    new Date(dayClose.date),
                                    "MMMM dd, yyyy"
                                  )}
                                </h4>
                              </div>
                              <div className="max-h-60 overflow-y-auto space-y-2">
                                {hourlyBreakdown.map((entry, index: number) => {
                                  // Use the correct property names from the API
                                  const revenue =
                                    entry?.revenue ||
                                    entry?.sales ||
                                    entry?.totalSales ||
                                    entry?.amount ||
                                    0;
                                  const orders =
                                    entry?.orders ||
                                    entry?.totalOrders ||
                                    entry?.orderCount ||
                                    entry?.count ||
                                    0;
                                  const hourStr =
                                    entry?.hour || entry?.time || "0:00";

                                  return (
                                    <div
                                      key={index}
                                      className="flex justify-between items-center p-2 rounded-md bg-muted/30"
                                    >
                                      <div className="flex items-center gap-2">
                                        <Badge
                                          variant="outline"
                                          className="text-xs"
                                        >
                                          {hourStr}
                                        </Badge>
                                        <span className="text-sm">
                                          {orders} orders
                                        </span>
                                      </div>
                                      <div className="text-sm font-medium">
                                        ${formatCurrency(revenue)}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                              <div className="border-t pt-2">
                                <div className="flex justify-between text-sm font-medium">
                                  <span>Total Hours Active:</span>
                                  <span>{summary.totalHours}</span>
                                </div>
                                <div className="flex justify-between text-sm font-medium">
                                  <span>Peak Hour:</span>
                                  <span>{summary.peakHour}</span>
                                </div>
                                <div className="flex justify-between text-sm font-medium">
                                  <span>Peak Sales:</span>
                                  <span>
                                    ${formatCurrency(summary.peakSales)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      ) : (
                        <div className="space-y-1 p-2">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span className="font-medium">
                              {format(new Date(dayClose.date), "MMM dd, yyyy")}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            No hourly data
                          </div>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      ${Number(dayClose.totalSales).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      {dayClose.totalOrders}
                    </TableCell>
                    <TableCell className="text-right">
                      {dayClose.totalCustomers}
                    </TableCell>
                    <TableCell className="text-right sm:table-cell hidden">
                      ${Number(dayClose.cashSales).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right sm:table-cell hidden">
                      ${Number(dayClose.abaSales).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right sm:table-cell hidden">
                      ${Number(dayClose.creditCardSales).toFixed(2)}
                    </TableCell>
                    <TableCell className="sm:table-cell hidden">
                      {dayClose.closedBy || "N/A"}
                    </TableCell>
                    <TableCell>
                      {format(new Date(dayClose.closedAt), "MMM dd, HH:mm")}
                    </TableCell>
                    <TableCell>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={deletingId === dayClose.id}
                            className="h-8 w-8 p-0"
                          >
                            {deletingId === dayClose.id ? (
                              <RefreshCcw className="h-3 w-3 animate-spin" />
                            ) : (
                              <Trash2 className="h-3 w-3" />
                            )}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Delete Day Close Record
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete the day close
                              record for{" "}
                              {format(new Date(dayClose.date), "MMMM dd, yyyy")}
                              ? This action cannot be undone and will
                              permanently remove all associated data including
                              hourly breakdown, payment methods, and sales
                              information.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(dayClose.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete Record
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile responsive summary for hourly breakdown */}
      <div className="sm:hidden mt-4 space-y-2">
        {!isLoading && data.length > 0 && (
          <>
            <p className="text-sm font-medium text-muted-foreground">
              Recent Day Hourly Summary:
            </p>
            {data.slice(0, 1).map((dayClose) => {
              const summary = getHourlyBreakdownSummary(
                dayClose.hourlyBreakdown
              );
              const hourlyData = parseHourlyBreakdown(dayClose.hourlyBreakdown);

              return (
                <div
                  key={`mobile-${dayClose.id}`}
                  className="text-sm space-y-2 p-3 bg-muted/30 rounded-md"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">
                      {format(new Date(dayClose.date), "MMM dd, yyyy")}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {summary.totalHours} hours
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Peak Hour:</span>
                    <span>{summary.peakHour}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Peak Sales:</span>
                    <span>${formatCurrency(summary.peakSales)}</span>
                  </div>
                  {hourlyData && (
                    <div className="mt-3">
                      <p className="text-xs font-medium text-muted-foreground mb-2">
                        Hourly Breakdown:
                      </p>
                      <div className="grid grid-cols-2 gap-1 max-h-32 overflow-y-auto">
                        {hourlyData.slice(0, 8).map((entry, index: number) => {
                          // Use the correct property names from the API
                          const revenue =
                            entry?.revenue ||
                            entry?.sales ||
                            entry?.totalSales ||
                            entry?.amount ||
                            0;
                          const hourStr = entry?.hour || entry?.time || "0:00";

                          return (
                            <div
                              key={index}
                              className="flex justify-between text-xs p-1 bg-background rounded"
                            >
                              <span>{hourStr}</span>
                              <span>${formatCurrency(revenue, 0)}</span>
                            </div>
                          );
                        })}
                      </div>
                      {hourlyData.length > 8 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          ...and {hourlyData.length - 8} more hours
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
