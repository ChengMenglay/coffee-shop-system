"use client";

import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { getColumns, IngredientStockColumn } from "./columns";
import { CalendarIcon, RefreshCcw } from "lucide-react";
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
import { useSession } from "next-auth/react";

type IngredientStockColumnProps = {
  data: IngredientStockColumn[];
};
function IngredientStockClient({ data }: IngredientStockColumnProps) {
  const router = useRouter();
  const [filterdData, setFilterdData] = useState<IngredientStockColumn[]>(data);
  const [status, setStatus] = useState("");
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>();
  const { data: session } = useSession();
  const userRole = session?.user.role ?? "";
  const columns = getColumns(userRole);
  useEffect(() => {
    setFilterdData(data);
  }, [data]);
  return (
    <>
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between">
        <Header
          title="Ingredient Stock"
          subtitle="Manage ingredient stock for your store."
          total={data.length}
        />
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1 my-2 w-full sm:w-auto overflow-x-auto">
          <Button
            variant={"outline"}
            size={"icon"}
            onClick={() => {
              setFilterdData(data);
              setStatus("");
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
                onClick={() => setDateRange(undefined)}
                className="w-full"
              >
                Clear
              </Button>
            </PopoverContent>
          </Popover>
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
          <Button
            onClick={() => router.push("/dashboard/stock-usage/action")}
            className="w-full sm:w-auto whitespace-nowrap"
          >
            Stock Action
          </Button>
        </div>
      </div>
      <Separator className="my-6" />
      <DataTable columns={columns} data={filterdData} />
    </>
  );
}

export default IngredientStockClient;
