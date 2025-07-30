"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatterUSD } from "@/lib/utils";
import {
  Banknote,
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  Eye,
  Landmark,
  ShoppingBag,
} from "lucide-react";
import React, { useState } from "react";
import { PendingOrder } from "../page";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import { CgSpinnerTwoAlt } from "react-icons/cg";

type NewOrderTypeProps = {
  data: PendingOrder;
  countItem: number;
};

function NewOrder({ data, countItem }: NewOrderTypeProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleOrderComplete = async () => {
    try {
      setIsLoading(true);
      const order = await axios.patch(`/api/order/${data.id}`, {
        ...data,
        orderStatus: "Completed",
      });
      router.refresh();
      toast.success(`The Order #${order.data.displayId} placed as Completed.`);
    } catch (error) {
      console.log(error);
      toast.error("Internal Server Error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOrderCancell = async () => {
    try {
      const order = await axios.patch(`/api/order/${data.id}`, {
        ...data,
        orderStatus: "Cancelled",
      });
      router.refresh();
      toast.success(`The Order #${order.data.displayId} placed as Cancelled.`);
    } catch (error) {
      console.log(error);
      toast.error("Internal Server Error");
    }
  };

  return (
    <Card className="group relative p-0 shadow-lg hover:shadow-2xl transition-all duration-500 border-0 bg-white overflow-hidden max-h-[700px] flex flex-col rounded-2xl backdrop-blur-sm">
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 via-white to-green-50/30 opacity-60" />

      {/* Header Section */}
      <div className="relative p-4 sm:p-6 bg-gradient-to-r from-emerald-600 via-emerald-500 to-green-500 text-white">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative flex flex-col sm:flex-row justify-between items-start gap-4">
          <div className="flex items-start space-x-3 sm:space-x-4 flex-1">
            <div className="rounded-2xl w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center bg-white/20 backdrop-blur-md border border-white/30 shadow-lg">
              <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 text-white drop-shadow-sm" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-3 mb-2">
                <h1 className="font-bold text-lg sm:text-xl truncate">
                  Order #{data.displayId}
                </h1>
                <div className="flex items-center gap-1 text-xs sm:text-sm text-emerald-100">
                  <Calendar className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{data.createdAt}</span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                {data.orderStatus === "Pending" ? (
                  <Badge className="bg-amber-400 text-amber-900 border-0 font-semibold px-3 py-1 shadow-sm">
                    {data.orderStatus}
                  </Badge>
                ) : (
                  <Badge className="bg-red-400 text-red-900 border-0 font-semibold px-3 py-1 shadow-sm">
                    {data.orderStatus}
                  </Badge>
                )}
                <div className="flex items-center space-x-1 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 border border-white/20">
                  {data.paymentStatus ? (
                    <>
                      <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-200" />
                      <span className="text-xs sm:text-sm font-medium">
                        Paid
                      </span>
                    </>
                  ) : (
                    <>
                      <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-200" />
                      <span className="text-xs sm:text-sm font-medium">
                        Unpaid
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="text-left sm:text-right flex-shrink-0">
            <h1 className="text-xl sm:text-2xl font-bold mb-1 drop-shadow-sm">
              {formatterUSD.format(data.total)}
            </h1>
            <div className="flex items-center justify-start sm:justify-end space-x-1 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 border border-white/20">
              {data.paymentMethod === "Cash" ? (
                <>
                  <Banknote className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-200" />
                  <span className="text-xs sm:text-sm font-medium">
                    {data.paymentMethod}
                  </span>
                </>
              ) : data.paymentMethod === "ABA" ? (
                <>
                  <Landmark className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-200" />
                  <span className="text-xs sm:text-sm font-medium">
                    {data.paymentMethod}
                  </span>
                </>
              ) : (
                <>
                  <CreditCard className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-200" />
                  <span className="text-xs sm:text-sm font-medium">
                    {data.paymentMethod}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Order Details */}
      <div className="relative px-4 sm:px-6 py-3 bg-gradient-to-r from-emerald-50 to-green-50 border-b border-emerald-100">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 text-sm">
          <span className="font-medium text-emerald-800">
            Order By:{" "}
            <span className="font-bold">
              {data.user.name} ({data.user.role.name})
            </span>
          </span>
          <span className="text-emerald-700 font-semibold bg-emerald-200/80 backdrop-blur-sm px-3 py-1 rounded-full border border-emerald-300/50 text-xs sm:text-sm">
            {formatterUSD.format(data.discount)} discount applied
          </span>
        </div>
      </div>

      {/* Items Header */}
      <div className="relative px-4 sm:px-6 py-4 bg-gradient-to-r from-slate-50 to-gray-50 border-b">
        <h2 className="font-bold text-base sm:text-lg text-gray-800 flex items-center">
          Items
          <span className="ml-2 bg-gradient-to-r from-gray-200 to-gray-300 text-gray-700 px-2 py-1 rounded-full text-xs sm:text-sm font-semibold shadow-sm">
            {countItem}
          </span>
        </h2>
      </div>

      {/* Scrollable Items Section */}
      <div className="relative flex-1 overflow-y-auto px-3 sm:px-6 py-2 space-y-3 max-h-64 scrollbar-thin scrollbar-thumb-emerald-200 scrollbar-track-gray-100">
        {data.orderItems.map((orderItem, idx) => (
          <div
            key={idx}
            className="group/item border border-gray-200/80 p-3 sm:p-4 rounded-xl shadow-sm bg-white/80 backdrop-blur-sm hover:shadow-lg hover:border-emerald-200 transition-all duration-300 hover:scale-[1.01]"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start gap-3 mb-3">
              <h3 className="font-bold text-gray-800 text-sm sm:text-lg leading-tight">
                {orderItem.product.name} x{orderItem.quantity}
              </h3>
              <div className="text-left sm:text-right flex-shrink-0">
                <div className="text-lg sm:text-xl font-bold text-gray-900">
                  {formatterUSD.format(orderItem.price)}
                </div>
                {orderItem.product.discount > 0 && (
                  <div className="text-xs sm:text-sm text-gray-500 line-through">
                    {formatterUSD.format(
                      Number(
                        orderItem.product.price + orderItem.size.priceModifier
                      )
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 mb-3">
              <Badge className="bg-emerald-100 text-emerald-700 border border-emerald-300/50 font-medium text-xs hover:bg-emerald-200 transition-colors">
                {orderItem.size.name}
              </Badge>
              <Badge className="bg-blue-100 text-blue-800 border border-blue-300/50 font-medium text-xs hover:bg-blue-200 transition-colors">
                {orderItem.sugar}% sugar
              </Badge>
              {orderItem.product.discount > 0 && (
                <Badge className="bg-red-100 text-red-800 border border-red-300/50 font-medium text-xs hover:bg-red-200 transition-colors">
                  {orderItem.product.discount}% OFF
                </Badge>
              )}
            </div>

            <div className="p-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 rounded-lg">
              <p className="text-xs sm:text-sm text-amber-800">
                <strong>Note:</strong> {orderItem.note || "No special notes"}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="relative p-3 sm:p-4 bg-gradient-to-r from-gray-50 to-slate-50 border-t border-gray-200 flex flex-col sm:flex-row gap-2 sm:gap-3">
        <Button
          disabled={isLoading}
          onClick={handleOrderComplete}
          className="flex-1 cursor-pointer bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold py-2.5 px-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] disabled:opacity-70 disabled:scale-100"
        >
          {isLoading && <CgSpinnerTwoAlt className="mr-2 animate-spin" />}
          {isLoading ? "Processing..." : "Mark Completed"}
        </Button>

        <Button
          disabled={isLoading}
          onClick={() => router.push(`/dashboard/order/${data.id}`)}
          size="icon"
          variant="outline"
          className="h-10 w-10 sm:w-auto sm:px-4 border-2 border-emerald-600 text-emerald-600 cursor-pointer hover:bg-emerald-600 hover:text-white transition-all duration-300 rounded-xl shadow-md hover:shadow-lg hover:scale-105 disabled:opacity-70 disabled:scale-100"
        >
          <Eye className="w-4 h-4" />
          <span className="hidden sm:inline ml-2">View</span>
        </Button>
                <Button
          disabled={isLoading}
          onClick={handleOrderCancell}
          className="flex-1 cursor-pointer bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-2.5 px-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] disabled:opacity-70 disabled:scale-100"
        >
          Cancel Order
        </Button>
      </div>

      {/* Subtle corner accent */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-white/20 to-transparent pointer-events-none" />
    </Card>
  );
}

export default NewOrder;
