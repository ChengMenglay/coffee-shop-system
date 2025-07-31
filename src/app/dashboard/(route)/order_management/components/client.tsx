"use client";
import React, { useEffect, useState } from "react";
import { OrderManagementColumn, columns } from "./column";
import Header from "@/components/Header";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import NewOrder from "./NewOrder";
import { PendingOrder } from "../page";
import NoResult from "@/components/NoResult";
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
import { Button } from "@/components/ui/button";
import { CalendarIcon, RefreshCcw } from "lucide-react";
type OrderManagementClientTypeProps = {
  orders: OrderManagementColumn[];
  pendingCount: number;
  draftCount: number;
  pendingOrderData: PendingOrder[];
};
function OrderManagementClient({
  orders,
  pendingCount,
  draftCount,
  pendingOrderData,
}: OrderManagementClientTypeProps) {
  const [selectedTab, setSelectedTab] = useState("new_order");
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>();
  const [filterPendingData, setFilterPendingData] =
    useState<PendingOrder[]>(pendingOrderData);
  const [filterdData, setFilterdData] =
    useState<OrderManagementColumn[]>(orders);
  const [paymentStatus, setPaymentStatus] = useState("");
  useEffect(() => {
    setFilterdData(orders);
    setFilterPendingData(pendingOrderData);
  }, [orders, pendingOrderData]);
  const completedData = filterdData.filter(
    (order) => order.orderStatus === "Completed"
  );
  const pendingData = filterPendingData.filter(
    (order) => order.orderStatus === "Pending"
  );
  const draftData = filterPendingData.filter(
    (order) => order.orderStatus === "Draft"
  );
  const cancelledData = filterdData.filter(
    (order) => order.orderStatus === "Cancelled"
  );
  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2">
        <Header
          title="Order Management"
          subtitle="Manage order for your store."
        />
        {(selectedTab === "completed" || selectedTab === "cancelled") && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1 my-2 w-full sm:w-auto overflow-x-auto">
            <Button
              variant={"outline"}
              size={"icon"}
              onClick={() => {
                setFilterdData(orders);
                setDateRange(undefined);
                setPaymentStatus("");
              }}
            >
              <RefreshCcw />
            </Button>
            <Select
              value={paymentStatus}
              onValueChange={(val) => {
                setPaymentStatus(val);
                if (val === "paid") {
                  setFilterdData(
                    orders.filter((data) => data.paymentStatus === true)
                  );
                } else if (val === "unPaid") {
                  setFilterdData(
                    orders.filter((data) => data.paymentStatus === false)
                  );
                } else {
                  setFilterdData(orders);
                }
              }}
            >
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder={"Select a Payment"} />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value={"paid"}>Paid</SelectItem>
                  <SelectItem value={"unPaid"}>UnPaid</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
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
                        orders.filter((item) => {
                          const orderDate = new Date(item.createdAt);
                          if (range.from && range.to) {
                            return (
                              orderDate >= range.from && orderDate <= range.to
                            );
                          }
                        })
                      );
                    } else {
                      setFilterdData(orders);
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
          </div>
        )}
      </div>
      <div className="flex justify-between items-center">
        <Tabs
          value={selectedTab}
          onValueChange={(val) => {
            setDateRange(undefined);
            setFilterdData(orders);
            setSelectedTab(val);
          }}
          className="my-4"
        >
          <TabsList>
            <TabsTrigger value="new_order">
              New Order
              {pendingCount > 0 && (
                <Badge className="text-xs rounded-full bg-red-500 text-white">
                  {pendingCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="draft">
              Draft
              {draftCount > 0 && (
                <Badge className="text-xs rounded-full bg-red-500 text-white">
                  {draftCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <Separator className="my-4" />
      {selectedTab === "completed" ? (
        completedData.length > 0 ? (
          <DataTable data={completedData} columns={columns} />
        ) : (
          <NoResult
            title="No completed orders"
            description="There are no completed orders yet. Orders will appear here once they are completed."
          />
        )
      ) : selectedTab === "cancelled" ? (
        cancelledData.length > 0 ? (
          <DataTable data={cancelledData} columns={columns} />
        ) : (
          <NoResult
            title="No cancelled orders"
            description="There are no cancelled orders. Orders will appear here when they are cancelled."
          />
        )
      ) : selectedTab === "draft" ? (
        <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-6">
          {draftData.length > 0 ? (
            draftData.map((draft) => (
              <NewOrder
                key={draft.id}
                data={draft}
                countItem={draft.orderItems.length}
              />
            ))
          ) : (
            <NoResult
              title="No draft orders"
              description="There are no draft orders. Items will appear here when saved as drafts."
            />
          )}
        </div>
      ) : selectedTab === "new_order" ? (
        <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-6">
          {pendingData.length > 0 ? (
            pendingData.map((order) => (
              <NewOrder
                key={order.id}
                data={order}
                countItem={order.orderItems.length}
              />
            ))
          ) : (
            <NoResult
              title="No pending orders"
              description="There are no pending orders. New orders will appear here when submitted."
            />
          )}
        </div>
      ) : null}
    </>
  );
}

export default OrderManagementClient;
