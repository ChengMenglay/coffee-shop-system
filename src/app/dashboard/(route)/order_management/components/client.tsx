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
import {
  AlertTriangle,
  CalendarIcon,
  Clock,
  Lock,
  RefreshCcw,
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { useRouter } from "next/navigation";
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
  const [selectedTab, setSelectedTab] = useState("system");
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>();
  const [isDayClosed, setIsDayClosed] = useState<boolean>(false);
  const router = useRouter();
  const [isCheckingDayStatus, setIsCheckingDayStatus] = useState<boolean>(true);
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
  const systemOrdersCount = filterPendingData.filter(
    (order) => order.oderFrom === "System" && order.orderStatus === "Pending"
  ).length;
  const mobileOrdersCount = filterPendingData.filter(
    (order) => order.oderFrom === "Mobile" && order.orderStatus === "Pending"
  ).length;
  // Check if day is already closed
  useEffect(() => {
    const checkDayStatus = async () => {
      try {
        const today = new Date().toISOString().split("T")[0];
        const response = await axios.get(`/api/day-close?date=${today}`);

        if (response.data) {
          setIsDayClosed(true);
          toast.error(
            "Store is closed for today. Online ordering is unavailable."
          );
        }
      } catch (error) {
        // If error, assume day is not closed (API might return 404 if no record)
        console.log("Day is not closed yet", error);
      } finally {
        setIsCheckingDayStatus(false);
      }
    };

    checkDayStatus();
  }, []);
  // Show loading state while checking day status
  if (isCheckingDayStatus) {
    return (
      <div className="my-6 flex flex-col items-center w-full min-h-[400px]">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Checking store status...</p>
          </div>
        </div>
      </div>
    );
  }
  return (
    <>
      <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2">
        {/* Day Closed Overlay */}
        {isDayClosed && (
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center min-h-[600px]">
            <div className="bg-white p-8 rounded-lg shadow-xl text-center max-w-md mx-4">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                  <Clock className="w-10 h-10 text-red-600" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                We are Closed
              </h2>
              <p className="text-gray-600 mb-4">
                Sorry, our store is closed for today. Online ordering is
                currently unavailable.
              </p>
              <div className="flex items-center justify-center text-sm text-red-600 mb-6">
                <AlertTriangle className="w-4 h-4 mr-2" />
                All online services are temporarily disabled
              </div>
              <div className="text-sm text-gray-500 mb-4">
                <p>Store Hours: 7:00 AM - 9:00 PM</p>
                <p>Come back tomorrow for fresh coffee!</p>
              </div>
              <Button
                onClick={() => router.push("/")}
                variant="outline"
                className="w-full"
              >
                <Lock className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </div>
          </div>
        )}
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
            <TabsTrigger value="system">
              System Orders
              {systemOrdersCount > 0 && (
                <Badge className="text-xs rounded-full bg-blue-500 text-white ml-1">
                  {systemOrdersCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="mobile">
              Mobile Orders
              {mobileOrdersCount > 0 && (
                <Badge className="text-xs rounded-full bg-purple-500 text-white ml-1">
                  {mobileOrdersCount}
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
      ) : selectedTab === "system" ? (
        <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-6">
          {filterPendingData.filter(
            (order) =>
              order.oderFrom === "System" && order.orderStatus === "Pending"
          ).length > 0 ? (
            filterPendingData
              .filter(
                (order) =>
                  order.oderFrom === "System" && order.orderStatus === "Pending"
              )
              .map((order) => (
                <NewOrder
                  key={order.id}
                  data={order}
                  countItem={order.orderItems.length}
                />
              ))
          ) : (
            <NoResult
              title="No system orders"
              description="There are no pending orders from the system. Orders placed through the system will appear here."
            />
          )}
        </div>
      ) : selectedTab === "mobile" ? (
        <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-6">
          {filterPendingData.filter(
            (order) =>
              order.oderFrom === "Mobile" && order.orderStatus === "Pending"
          ).length > 0 ? (
            filterPendingData
              .filter(
                (order) =>
                  order.oderFrom === "Mobile" && order.orderStatus === "Pending"
              )
              .map((order) => (
                <NewOrder
                  key={order.id}
                  data={order}
                  countItem={order.orderItems.length}
                />
              ))
          ) : (
            <NoResult
              title="No mobile orders"
              description="There are no pending orders from mobile. Orders placed through the mobile app will appear here."
            />
          )}
        </div>
      ) : null}
    </>
  );
}

export default OrderManagementClient;
