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

  // Calculate item base price (before product discount)
  const calculateItemBasePrice = (item: PendingOrder["orderItems"][0]) => {
    let basePrice = item.product.price;

    // Add size modifier if applicable
    if (item.size?.priceModifier) {
      basePrice += item.size.priceModifier;
    }

    // Add extra shot modifier if applicable
    if (item.extraShot?.priceModifier) {
      basePrice += item.extraShot.priceModifier;
    }

    return basePrice;
  };

  // Calculate item price with product discount
  const calculateItemDiscountedPrice = (
    item: PendingOrder["orderItems"][0]
  ) => {
    const basePrice = calculateItemBasePrice(item);
    const productDiscount = item.product.discount || 0;

    if (productDiscount > 0) {
      const discountAmount = basePrice * (productDiscount / 100);
      return basePrice - discountAmount;
    }

    return basePrice;
  };

  // Calculate total product discounts for the order
  const calculateTotalProductDiscounts = () => {
    return data.orderItems.reduce((totalDiscount, item) => {
      const basePrice = calculateItemBasePrice(item);
      const discountedPrice = calculateItemDiscountedPrice(item);
      const itemDiscount = (basePrice - discountedPrice) * item.quantity;
      return totalDiscount + itemDiscount;
    }, 0);
  };

  // Calculate subtotal after product discounts
  const calculateSubtotal = () => {
    return data.orderItems.reduce((total, item) => {
      return total + calculateItemDiscountedPrice(item) * item.quantity;
    }, 0);
  };

  const handleOrderComplete = async () => {
    try {
      setIsLoading(true);
      const order = await axios.patch(`/api/order/${data.id}`, {
        ...data,
        orderStatus: "Completed",
        paymentStatus: true,
      });
      try {
        await axios.post("/api/telegram/notify", {
          statusUpdate: {
            action: "complete",
            displayId: data.displayId,
          },
        });
      } catch (telegramError) {
        console.log("Failed to send Telegram notification:", telegramError);
      }
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
      try {
        await axios.post("/api/telegram/notify", {
          statusUpdate: {
            action: "cancel",
            displayId: data.displayId,
          },
        });
      } catch (telegramError) {
        console.log("Failed to send Telegram notification:", telegramError);
      }
      router.refresh();
      toast.success(`The Order #${order.data.displayId} placed as Cancelled.`);
    } catch (error) {
      console.log(error);
      toast.error("Internal Server Error");
    }
  };

  const totalProductDiscounts = calculateTotalProductDiscounts();
  const subtotal = calculateSubtotal();

  return (
    <Card className="group relative overflow-hidden bg-white/95 backdrop-blur-sm border border-gray-200/50 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 max-w-sm">
      {/* Compact Header */}
      <div className="bg-gradient-to-r from-slate-900 to-gray-800 p-3 text-white">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h1 className="font-bold text-sm">#{data.displayId}</h1>
              <div className="flex items-center gap-1 text-xs text-gray-300">
                <Calendar className="w-3 h-3" />
                {data.createdAt}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold">
              {formatterUSD.format(data.total)}
            </div>
            <div className="flex items-center gap-1 text-xs">
              {data.paymentMethod === "Cash" ? (
                <Banknote className="w-3 h-3" />
              ) : data.paymentMethod === "ABA" ? (
                <Landmark className="w-3 h-3" />
              ) : (
                <CreditCard className="w-3 h-3" />
              )}
              {data.paymentMethod}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Badge
              className={`text-xs px-2 py-0.5 ${
                data.orderStatus === "Pending"
                  ? "bg-amber-500 text-white"
                  : "bg-red-500 text-white"
              }`}
            >
              {data.orderStatus}
            </Badge>
            <Badge
              className={`text-xs px-2 py-0.5 ${
                data.paymentStatus
                  ? "bg-green-500 text-white"
                  : "bg-gray-500 text-white"
              }`}
            >
              {data.paymentStatus ? (
                <>
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Paid
                </>
              ) : (
                <>
                  <Clock className="w-3 h-3 mr-1" />
                  Unpaid
                </>
              )}
            </Badge>
          </div>
          <div className="text-xs bg-white/20 px-2 py-1 rounded">
            {countItem} items
          </div>
        </div>
      </div>

      {/* Customer Info */}
      <div className="px-3 py-2 bg-gray-50 border-b text-xs">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">
            <strong>{data.user.name}</strong> ({data.user.role.name})
          </span>
          <div className="flex gap-1">
            {totalProductDiscounts > 0 && (
              <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded">
                {formatterUSD.format(totalProductDiscounts)} product savings
              </span>
            )}
            {data.discount > 0 && (
              <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded">
                {formatterUSD.format(data.discount)} order discount
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Compact Items List */}
      <div className="max-h-48 overflow-y-auto">
        {data.orderItems.map((item, idx) => {
          const basePrice = calculateItemBasePrice(item);
          const discountedPrice = calculateItemDiscountedPrice(item);
          const hasProductDiscount =
            item.product.discount && item.product.discount > 0 ? true : false;

          return (
            <div
              key={idx}
              className="px-3 py-2 border-b border-gray-100 last:border-b-0 hover:bg-gray-50/50 transition-colors"
            >
              <div className="flex justify-between items-start mb-1">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm text-gray-900 truncate">
                    {item.product.name} x{item.quantity}
                  </h3>
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {item.size && (
                      <Badge
                        variant="outline"
                        className="text-xs px-1.5 py-0 h-5"
                      >
                        {item.size.sizeName}
                      </Badge>
                    )}
                    {item.sugar && (
                      <Badge
                        variant="outline"
                        className="text-xs px-1.5 py-0 h-5"
                      >
                        {item.sugar.name}
                      </Badge>
                    )}
                    {item.ice && (
                      <Badge
                        variant="outline"
                        className="text-xs px-1.5 py-0 h-5"
                      >
                        {item.ice.name}
                      </Badge>
                    )}
                    {item.extraShot && (
                      <Badge
                        variant="outline"
                        className="text-xs px-1.5 py-0 h-5"
                      >
                        +{item.extraShot.name}
                      </Badge>
                    )}
                    {hasProductDiscount && (
                      <Badge className="text-xs px-1.5 py-0 h-5 bg-red-100 text-red-700">
                        {item.product.discount}% OFF
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="text-right ml-2">
                  <div className="font-bold text-sm">
                    {formatterUSD.format(discountedPrice * item.quantity)}
                  </div>
                  {hasProductDiscount && (
                    <div className="text-xs text-gray-500 line-through">
                      {formatterUSD.format(basePrice * item.quantity)}
                    </div>
                  )}
                </div>
              </div>
              {item.note && (
                <p className="text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded mt-1">
                  {item.note}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Order Summary */}
      {(totalProductDiscounts > 0 || data.discount > 0) && (
        <div className="px-3 py-2 bg-gray-50 border-b text-xs space-y-1">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>{formatterUSD.format(subtotal)}</span>
          </div>
          {data.discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Order Discount:</span>
              <span>-{formatterUSD.format(data.discount)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold border-t pt-1">
            <span>Total:</span>
            <span>{formatterUSD.format(data.total)}</span>
          </div>
        </div>
      )}

      {/* Compact Action Buttons */}
      <div className="p-3 bg-gray-50 flex gap-2">
        <Button
          disabled={isLoading}
          onClick={handleOrderCancell}
          size="sm"
          className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs"
        >
          Cancel
        </Button>
        <Button
          disabled={isLoading}
          onClick={handleOrderComplete}
          size="sm"
          className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs"
        >
          {isLoading && (
            <CgSpinnerTwoAlt className="w-3 h-3 mr-1 animate-spin" />
          )}
          {isLoading ? "Processing..." : "Complete"}
        </Button>
      </div>
    </Card>
  );
}

export default NewOrder;
