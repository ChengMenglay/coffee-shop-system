"use client";

import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
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
import { columns, PurchaseColumn } from "./columns";
import { Ingredient } from "@/generated/prisma";

type PurchaseColumnProps = {
  data: PurchaseColumn[];
  ingredients: Ingredient[];
};
function PurchaseClient({ data, ingredients }: PurchaseColumnProps) {
  const router = useRouter();
  const [filterdData, setFilterdData] = useState<PurchaseColumn[]>(data);
  const [ingredient, setIngredient] = useState("");
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>();
  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 space-x-2">
        <Header
          title="Purchases"
          subtitle="Manage purchase stock for your store."
          total={data.length}
        />
        <div className="grid md:grid-cols-4 sm:grid-cols-3 grid-cols-2 gap-2">
          <Button
            variant={"outline"}
            onClick={() => {
              setIngredient("");
              setDateRange(undefined);
              setFilterdData(data);
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
              <SelectValue placeholder={"Select a status"} />
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
