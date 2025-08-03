"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import useCart, { CartItem } from "@/hooks/use-cart";
import { formatterUSD } from "@/lib/utils";
import axios from "axios";
import {
  Banknote,
  CreditCard,
  Landmark,
  LucideIcon,
  Check,
  ClipboardList,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { CgSpinnerAlt } from "react-icons/cg";
import { toast } from "sonner";
import { Size, Sugar, Ice, ExtraShot } from "types";

type PaymentType = "Cash" | "ABA" | "Credit Card";

const paymentMethod: {
  name: PaymentType;
  icon: LucideIcon;
  color: string;
  description: string;
}[] = [
  {
    name: "Cash",
    icon: Banknote,
    color:
      "bg-green-50 border-green-200 text-green-700 hover:bg-green-100 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300",
    description: "Cash payment",
  },
  {
    name: "ABA",
    icon: Landmark,
    color:
      "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300",
    description: "ABA Bank",
  },
  {
    name: "Credit Card",
    icon: CreditCard,
    color:
      "bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100 dark:bg-purple-900/20 dark:border-purple-800 dark:text-purple-300",
    description: "Credit/Debit Card",
  },
];

type OrderDetailProps = {
  sizes: Size[] | null;
  sugars?: Sugar[] | null;
  ices?: Ice[] | null;
  extraShots?: ExtraShot[] | null;
};

export default function OrderDetail({ sizes, sugars }: OrderDetailProps) {
  const { data: session } = useSession();
  const {
    items,
    note,
    removeAll,
    getCartSubtotal,
    getCartTotal,
    getDiscountAmount,
    calculateItemPrice,
    calculateItemPriceWithProductDiscount,
  } = useCart();

  const [selectedPayment, setSelectedPayment] = useState<PaymentType>("Cash");
  const [paidMoney, setPaidMoney] = useState("");
  const [currency, setCurrency] = useState<"dollar" | "riel">("dollar");
  const [loading, setLoading] = useState(false);
  const [loadingDraft, setLoadingDraft] = useState(false);
  const router = useRouter();

  // Use cart's built-in calculation methods
  const subTotal = getCartSubtotal();
  const discountAmount = getDiscountAmount();
  const total = getCartTotal();

  const riel = 4100;
  const paid = Number(paidMoney) || 0;
  const paidInDollar = currency === "riel" ? paid / riel : paid;
  const change = Math.max(Number((paidInDollar - Number(total)).toFixed(2)), 0);
  const totalInRiel = Math.round((total * riel) / 100) * 100;

  // Validate cart items for missing size or sugar selections
  const validateCartItems = () => {
    const itemsWithMissingInfo: string[] = [];

    items.forEach((item) => {
      const productSizes =
        sizes?.filter((size) => size.productId === item.id) || [];
      const productSugars =
        sugars?.filter((sugar) => sugar.productId === item.id) || [];
      const missingInfo: string[] = [];

      // Check if product has size options but no size selected
      if (
        productSizes.length > 0 &&
        (!item.size?.name || item.size.name.trim() === "")
      ) {
        missingInfo.push("size");
      }

      // Check if product has sugar options but no sugar level selected
      if (
        productSugars.length > 0 &&
        (!item.sugar || item.sugar.trim() === "")
      ) {
        missingInfo.push("sugar level");
      }

      if (missingInfo.length > 0) {
        itemsWithMissingInfo.push(`${item.name}: ${missingInfo.join(" and ")}`);
      }
    });

    if (itemsWithMissingInfo.length > 0) {
      toast.error(
        `Please select missing options for: ${itemsWithMissingInfo.join(", ")}`
      );
      return false;
    }

    return true;
  };

  // Get display price for an item (including product discount)
  const getDisplayPrice = (item: CartItem) => {
    return calculateItemPriceWithProductDiscount(item);
  };

  const handlePaymentProcessing = async () => {
    // Validate cart items before proceeding
    if (!validateCartItems()) {
      return;
    }

    try {
      setLoading(true);
      const isFullyPaid = paidInDollar >= Number(total.toFixed(2));

      const payload = {
        userId: session?.user?.id as string,
        paymentMethod: selectedPayment,
        paymentStatus: isFullyPaid ? true : false,
        orderStatus: "Completed",
        discount: discountAmount > 0 ? discountAmount : 0,
        total: Number(total.toFixed(2)),
      };

      const order = await axios.post("/api/order", payload);
      if (order?.data?.id) {
        try {
          await Promise.all(
            items.map((item) => {
              return axios.post("/api/order_item", {
                orderId: order.data.id,
                productId: item.id,
                price: getDisplayPrice(item), // Price per item, not total
                quantity: item.quantity,
                sizeId: item.sizeId || undefined,
                sugarId: item.sugarId || undefined,
                iceId: item.iceId || undefined,
                extraShotId: item.extraShotId || undefined,
                note: item.note || undefined,
              });
            })
          );
          toast.success("Payment processed and order created!");
          router.push(`/dashboard/order/${order.data.id}`);
          removeAll();
        } catch {
          toast.error("Failed to create order items");
        }
      }
    } catch {
      toast.warning("Something went wrong, cannot process the payment!");
    } finally {
      setLoading(false);
    }
  };

  const handleDraft = async () => {
    // Validate cart items before proceeding
    if (!validateCartItems()) {
      return;
    }

    try {
      setLoadingDraft(true);
      const isFullyPaid = paidInDollar >= Number(total.toFixed(2));

      const payload = {
        userId: session?.user?.id as string,
        paymentMethod: selectedPayment,
        paymentStatus: isFullyPaid ? true : false,
        orderStatus: "Draft",
        discount: discountAmount > 0 ? discountAmount : 0,
        total: Number(total.toFixed(2)),
      };

      const order = await axios.post("/api/order", payload);
      if (order?.data?.id) {
        try {
          await Promise.all(
            items.map((item) => {
              return axios.post("/api/order_item", {
                orderId: order.data.id,
                productId: item.id,
                price: getDisplayPrice(item), // Price per item, not total
                quantity: item.quantity,
                sizeId: item.sizeId || undefined,
                sugarId: item.sugarId || undefined,
                iceId: item.iceId || undefined,
                extraShotId: item.extraShotId || undefined,
                note: item.note || undefined,
              });
            })
          );
          toast.success("Draft order created!");
          router.push("/dashboard/order");
          removeAll();
        } catch {
          toast.error("Failed to create order items");
        }
      }
    } catch {
      toast.warning("Something went wrong, cannot create draft!");
    } finally {
      setLoadingDraft(false);
    }
  };

  return (
    <>
      <Card className="grid grid-cols-1 sm:grid-cols-12 gap-4 h-full pb-20 sm:pb-0">
        {/* Sale Summary Panel */}
        <div className="sm:col-span-7 p-4 sm:p-6 bg-gray-50 dark:bg-transparent flex flex-col gap-6">
          <div>
            <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
              <ClipboardList className="w-5 h-5" />
              Sale Summary
            </h2>
            <Separator />
          </div>

          {/* Desktop Table */}
          <div className="hidden md:grid grid-cols-8 font-semibold border-b pb-2 text-sm text-muted-foreground">
            <span>Name</span>
            <span className="text-center">Size</span>
            <span className="text-center">Sugar</span>
            <span className="text-center">Ice</span>
            <span className="text-center">Qty</span>
            <span className="text-center">Unit Price</span>
            <span className="text-center">Discount</span>
            <span className="text-right">Sub Total</span>
          </div>

          {/* Items */}
          <div className="mt-2 space-y-3 divide-y divide-gray-200 dark:divide-gray-700">
            {items.map((item, idx) => (
              <div
                key={item.cartItemId}
                className={`md:grid md:grid-cols-8 items-center gap-2 py-3 px-2 rounded-lg ${
                  idx % 2 === 0
                    ? "bg-gray-50 dark:bg-gray-800"
                    : "bg-white dark:bg-gray-900"
                }`}
              >
                {/* Mobile View */}
                <div className="md:hidden text-sm space-y-1">
                  <div className="font-semibold">{item.name}</div>
                  <div className="flex justify-between text-muted-foreground">
                    <div>
                      <div>Qty: {item.quantity}</div>
                      <div>
                        Price: {formatterUSD.format(calculateItemPrice(item))}
                      </div>
                      {item.discount && (
                        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600 dark:text-gray-400 text-sm">
                              Discount Applied:
                            </span>
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                              -{item.discount}% OFF
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div>Size: {item.size?.name || "N/A"}</div>
                      <div>Sugar: {item.sugar || "N/A"}</div>
                      <div>Ice: {item.ice || "N/A"}</div>
                      <div>
                        {formatterUSD.format(
                          getDisplayPrice(item) * Number(item.quantity)
                        )}
                      </div>
                      {item.extraShot?.name && (
                        <div className="text-xs text-blue-600">
                          +{item.extraShot.name}
                        </div>
                      )}
                      {item.note && (
                        <div className="text-xs text-gray-500 mt-1">
                          Note: {item.note}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Desktop View */}
                <span className="hidden md:block">{item.name}</span>
                <span className="hidden md:block text-center">
                  {item.size?.name || "N/A"}
                </span>
                <span className="hidden md:block text-center">
                  {item.sugar || "N/A"}
                </span>
                <span className="hidden md:block text-center">
                  {item.ice || "N/A"}
                </span>
                <span className="hidden md:block text-center">
                  {item.quantity}
                </span>
                <span className="hidden md:block text-right">
                  {formatterUSD.format(calculateItemPrice(item))}
                  {item.extraShot?.name && (
                    <div className="text-xs text-blue-600">
                      +{item.extraShot.name}
                    </div>
                  )}
                </span>
                <span className="hidden md:block text-center">
                  {item.discount ? `${item.discount}%` : "0%"}
                </span>
                <span className="hidden md:block text-right">
                  {formatterUSD.format(
                    getDisplayPrice(item) * Number(item.quantity)
                  )}
                  {item.note && (
                    <div className="text-xs text-gray-500 mt-1">
                      Note: {item.note}
                    </div>
                  )}
                </span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="text-sm sm:text-base space-y-2">
            <Separator />
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatterUSD.format(subTotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Discount:</span>
              <span>
                {discountAmount > 0
                  ? `- ${formatterUSD.format(discountAmount)}`
                  : "$0.00"}
              </span>
            </div>
            {note && (
              <div className="flex justify-between text-sm text-gray-600">
                <span>Order Note:</span>
                <span className="max-w-xs truncate">{note}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg pt-2 border-t">
              <span>Order Total:</span>
              <div className="flex flex-col text-right">
                <span>{formatterUSD.format(total)}</span>
                <span>៛{totalInRiel.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Panel */}
        <div className="sm:col-span-5 p-4 sm:p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Pay</h2>
            <Button variant="secondary" className="font-bold px-6">
              {formatterUSD.format(total)}
            </Button>
          </div>

          {/* Payment Method */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Payment Method</Label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {paymentMethod.map((method) => (
                <div
                  key={method.name}
                  onClick={() => setSelectedPayment(method.name)}
                  className={`relative flex flex-col items-center justify-center p-2 border-2 rounded-xl cursor-pointer transition-all duration-200 transform ${
                    selectedPayment === method.name
                      ? `${method.color} border-current shadow-lg scale-105`
                      : "border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600"
                  }`}
                >
                  {selectedPayment === method.name && (
                    <div className="absolute -top-2 -right-2 bg-current text-white rounded-full p-1">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                  <method.icon className="w-8 h-8 mb-1" />
                  <span className="font-semibold text-sm text-center">
                    {method.name}
                  </span>
                  <span className="text-xs text-muted-foreground text-center">
                    {method.description}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Input */}
          <div className="bg-gray-50 dark:bg-gray-900/50 border rounded-xl p-5 space-y-4">
            <Label className="text-base font-medium">Customer Paid</Label>
            <div className="flex items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="lg" className="min-w-16 h-12">
                    {currency === "dollar" ? "$" : "៛"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setCurrency("dollar")}>
                    $ Dollar
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setCurrency("riel")}>
                    ៛ Riel
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Input
                disabled={loading || loadingDraft}
                type="number"
                min={0}
                placeholder="0.00"
                className="h-12 text-lg font-medium bg-white dark:bg-gray-800"
                value={paidMoney}
                onChange={(e) => setPaidMoney(e.target.value)}
              />
            </div>

            {paidMoney && paidInDollar < Number(total.toFixed(2)) && (
              <div className="text-red-500 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg flex gap-2 items-center">
                <div className="w-2 h-2 bg-red-500 rounded-full" />
                Insufficient payment amount.
              </div>
            )}

            <div className="text-xs text-muted-foreground text-center bg-white dark:bg-gray-800 p-2 rounded-lg">
              Exchange Rate: 1 USD = 4,100 KHR
            </div>
          </div>

          {/* Change */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-xl p-5 text-center">
            <div className="text-sm text-green-600 dark:text-green-400 mb-1">
              Change Money
            </div>
            <div className="text-2xl font-bold text-green-700 dark:text-green-300">
              {currency === "dollar"
                ? `$${change.toFixed(2)}`
                : `៛${(
                    Math.round((change * riel) / 100) * 100
                  ).toLocaleString()}`}
            </div>
          </div>

          {/* Buttons */}
          <div className="sm:flex hidden flex-wrap justify-between gap-3 pt-2">
            <div className="flex items-center space-x-2">
              <Button
                disabled={loading || loadingDraft}
                variant="outline"
                onClick={() => router.push("/dashboard/order")}
              >
                Back to Sale
              </Button>
              <Button
                disabled={loading || loadingDraft}
                variant="outline"
                onClick={handleDraft}
              >
                {loadingDraft && <CgSpinnerAlt className="animate-spin mr-2" />}
                {loadingDraft ? "Processing..." : "Draft"}
              </Button>
            </div>
            <Button
              onClick={handlePaymentProcessing}
              disabled={
                paidInDollar < Number(total.toFixed(2)) ||
                loading ||
                loadingDraft
              }
            >
              {loading && <CgSpinnerAlt className="animate-spin mr-2" />}
              {loading ? "Processing..." : "Process Payment"}
            </Button>
          </div>
          <div className="flex sm:hidden pt-2">
            <div className="flex items-center space-x-2">
              <Button
                disabled={loading || loadingDraft}
                variant="outline"
                onClick={() => router.push("/dashboard/order")}
              >
                Back to Sale
              </Button>
              <Button
                disabled={loading || loadingDraft}
                variant="outline"
                onClick={handleDraft}
              >
                {loadingDraft && <CgSpinnerAlt className="animate-spin mr-2" />}
                {loadingDraft ? "Processing..." : "Draft"}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Sticky CTA for mobile */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t p-4 sm:hidden z-10">
        <Button
          onClick={handlePaymentProcessing}
          disabled={
            paidInDollar < Number(total.toFixed(2)) || loading || loadingDraft
          }
          className="w-full"
        >
          {loading && <CgSpinnerAlt className="animate-spin mr-2" />}
          {loading ? "Processing..." : "Process Payment"}
        </Button>
      </div>
    </>
  );
}
