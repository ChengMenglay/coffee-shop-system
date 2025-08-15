"use client";

import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { CalendarIcon, Download, RefreshCcw } from "lucide-react";
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
import { columns, PurchaseColumn } from "./columns";
import { Ingredient } from "@prisma/client";

type PurchaseColumnProps = {
  data: PurchaseColumn[];
  ingredients: Ingredient[];
};
function PurchaseClient({ data, ingredients }: PurchaseColumnProps) {
  const router = useRouter();
  const [filterdData, setFilterdData] = useState<PurchaseColumn[]>(data);
  const [ingredient, setIngredient] = useState("");
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>();
  const [isExporting, setIsExporting] = useState(false);
  useEffect(() => {
    setFilterdData(data);
  }, [data]);
  const exportToCSV = () => {
    if (!filterdData.length) {
      alert("No data to export");
      return;
    }

    setIsExporting(true);

    try {
      // CSV Headers
      const headers = [
        "Purchase ID",
        "Ingredient Name",
        "Quantity Purchased",
        "Unit Price",
        "Total Amount",
        "Supplier Name",
        "Purchased By",
        "Purchase Date",
        "Day of Week",
        "Month/Year",
      ];

      // Convert data to CSV format with enhanced information
      const csvData = filterdData.map((item, index) => {
        // Extract numeric values from formatted strings
        const priceValue = item.price.replace(/[$,]/g, ""); // Remove $ and commas
        const quantityMatch = item.quantity.match(/^(\d+(?:\.\d+)?)/); // Extract number from "150 kg"
        const quantity = quantityMatch ? parseFloat(quantityMatch[1]) : 0;
        const unitMatch = item.quantity.match(/\s(.+)$/); // Extract unit from "150 kg"
        const unit = unitMatch ? unitMatch[1] : "";

        // Calculate total amount (price * quantity)
        const unitPrice = parseFloat(priceValue);
        const totalAmount = (unitPrice * quantity).toFixed(2);

        // Parse date for additional info
        const purchaseDate = new Date(item.createdAt);
        const dayOfWeek = format(purchaseDate, "EEEE");
        const monthYear = format(purchaseDate, "MMMM yyyy");

        return [
          `P${String(index + 1).padStart(4, "0")}`, // Purchase ID: P0001, P0002, etc.
          `"${item.ingredient}"`,
          `"${quantity} ${unit}"`,
          `"$${unitPrice.toFixed(2)}"`,
          `"$${totalAmount}"`,
          `"${item.supplier}"`,
          `"${item.purchasedBy}"`,
          `"${item.createdAt}"`,
          `"${dayOfWeek}"`,
          `"${monthYear}"`,
        ];
      });

      // Calculate totals for summary
      const totalPurchases = filterdData.length;
      const totalAmount = filterdData.reduce((sum, item) => {
        const priceValue = parseFloat(item.price.replace(/[$,]/g, ""));
        const quantityMatch = item.quantity.match(/^(\d+(?:\.\d+)?)/);
        const quantity = quantityMatch ? parseFloat(quantityMatch[1]) : 0;
        return sum + priceValue * quantity;
      }, 0);

      // Add summary rows
      const summaryRows = [
        ["", "", "", "", "", "", "", "", "", ""], // Empty row
        ["=== PURCHASE SUMMARY ===", "", "", "", "", "", "", "", "", ""],
        [
          "Total Purchases:",
          totalPurchases.toString(),
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
          "Total Amount:",
          `$${totalAmount.toFixed(2)}`,
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
          format(new Date(), "dd MMMM yyyy HH:mm"),
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
        ],
        ["Exported By:", "Coffee Shop System", "", "", "", "", "", "", "", ""],
      ];

      // Add filter information if filters are applied
      const filterInfo = [];
      if (ingredient) {
        filterInfo.push([
          "Filter Applied - Ingredient:",
          `"${ingredient}"`,
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
        ]);
      }

      // Combine all data
      const csvContent = [
        headers.join(","),
        ...csvData.map((row) => row.join(",")),
        ...summaryRows.map((row) => row.join(",")),
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
        let filename = `purchases-report-${currentDate}`;

        // Add filter info to filename
        if (ingredient) {
          const cleanIngredient = ingredient
            .replace(/[^a-zA-Z0-9]/g, "-")
            .toLowerCase();
          filename += `-${cleanIngredient}`;
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
          title="Purchases"
          subtitle="Manage purchase stock for your store."
          total={data.length}
        />
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1 my-2 w-full sm:w-auto overflow-x-auto">
          <Button
            variant={"outline"}
            size={"icon"}
            onClick={() => {
              setFilterdData(data);
              setIngredient("");
              setDateRange(undefined);
            }}
          >
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
                onClick={() => setDateRange(undefined)}
                className="w-full"
              >
                Clear
              </Button>
            </PopoverContent>
          </Popover>
          <Select
            value={ingredient}
            onValueChange={(value) => {
              setIngredient(value);
              setFilterdData(
                value ? data.filter((item) => item.ingredient === value) : data
              );
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={"Select an ingredient"} />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {ingredients.map((item) => (
                  <SelectItem key={item.id} value={item.name}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={exportToCSV}
            disabled={isExporting || filterdData.length === 0}
            className="flex items-center gap-2 whitespace-nowrap"
            title={`Export ${filterdData.length} purchase records to CSV`}
          >
            <Download className="h-4 w-4" />
            {isExporting ? "Exporting..." : "Export CSV"}
          </Button>
          <Button onClick={() => router.push("/dashboard/purchase/action")}>
            Purchase
          </Button>
        </div>
      </div>
      <Separator className="my-6" />
      <DataTable columns={columns} data={filterdData} />
    </>
  );
}

export default PurchaseClient;
