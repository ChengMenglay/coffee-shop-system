"use client";
import NoResult from "@/components/NoResult";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import useCart, { CartItem } from "@/hooks/use-cart";
import useSheet from "@/hooks/use-sheet";
import { formatterUSD } from "@/lib/utils";
import React from "react";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import axios from "axios";
import { useRouter } from "next/navigation";
import CartItems from "./CartItems";
import { CgSpinner } from "react-icons/cg";
import { ShoppingBag } from "lucide-react";
import { getSession } from "next-auth/react";

function CartSheet() {
  const {
    items,
    getCartTotal,
    calculateItemPriceWithProductDiscount,
    getDiscountAmount,
    removeAll,
    getAppliedPromotions,
    getCartSubtotal,
  } = useCart();

  const router = useRouter();
  const { open, onOpen, onClose } = useSheet();
  const [loading, setLoading] = React.useState(false);
  // Calculate totals
  const cartDiscount = getDiscountAmount();
  const total = getCartTotal();
  const subtotal = getCartSubtotal();
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const appliedPromotions = getAppliedPromotions();
  const getDisplayPrice = (item: CartItem) => {
    return calculateItemPriceWithProductDiscount(item);
  };
  const handleOrder = async () => {
    try {
      const freshSession = await getSession();
      setLoading(true);
      const payload = {
        userId: freshSession?.user.id,
        paymentMethod: "Cash",
        paymentStatus: false,
        orderStatus: "Pending",
        discount: cartDiscount > 0 ? cartDiscount : 0,
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
                price: getDisplayPrice(item), // Price per item after product discount
                quantity: item.quantity,
                sizeId: item.sizeId || null,
                sugarId: item.sugarId || null,
                iceId: item.iceId || null,
                extraShotId: item.extraShotId || null,
                note: item.note || null,
              });
            })
          );
          await fetch("/api/telegram/notify", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              orderId: order.data.id,
            }),
          });

          toast.success("Your order has been placed successfully!");
          router.push(`/`);
          removeAll();
          onClose();
        } catch (error) {
          console.error("Error creating order items:", error);
          toast.error("Failed to place order items");
        }
      }
    } catch (error) {
      console.error("Error placing order:", error);
      toast.error("Something went wrong, cannot process the order!");
    } finally {
      setLoading(false);
    }
  };
  return (
    <Sheet open={open} onOpenChange={(open) => (open ? onOpen() : onClose())}>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto flex flex-col">
        <SheetHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5" />
              Shopping Cart
              {items.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {totalItems} {totalItems === 1 ? "item" : "items"}
                </Badge>
              )}
            </SheetTitle>
          </div>
        </SheetHeader>

        {/* Cart Content */}
        <div className="flex-1 py-4">
          {items.length > 0 ? (
            <CartItems />
          ) : (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
              {/* <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <ShoppingBag className="w-8 h-8 text-gray-400" />
              </div> */}
              <NoResult
                title="Your cart is empty"
                description="Add items to your cart to get started."
              />
            </div>
          )}
        </div>

        {/* Cart Summary & Footer */}
        {items.length > 0 && (
          <SheetFooter className="flex-col space-y-0 border-t pt-4">
            <div className="w-full space-y-2">
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Subtotal</span>
                <span className="text-green-600">
                  {formatterUSD.format(subtotal)}
                </span>
              </div>
              {appliedPromotions.length > 0 && (
                <li className="p-2 rounded-sm border-t bg-blue-50 dark:bg-blue-900/10">
                  <span className="font-semibold text-blue-700 text-xs">
                    Applied Promotions:
                  </span>
                  <div className="space-y-1 mt-1">
                    {appliedPromotions.map((promo, index: number) => (
                      <div
                        key={index}
                        className="text-xs text-blue-600 flex justify-between"
                      >
                        <span>{promo.promotionName}</span>
                        <span>
                          -{formatterUSD.format(promo.discountAmount)}
                        </span>
                      </div>
                    ))}
                  </div>
                </li>
              )}
              {/* Total */}
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-green-600">
                  {formatterUSD.format(total)}
                </span>
              </div>

              {/* Place Order Button */}
              <Button
                onClick={handleOrder}
                className="w-full h-12 text-base font-medium"
                disabled={loading || items.length === 0}
              >
                {loading ? (
                  <>
                    <CgSpinner className="animate-spin mr-2 w-4 h-4" />
                    Placing Order...
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    Place Order • {formatterUSD.format(total)}
                  </>
                )}
              </Button>

              {/* Order Info */}
              <div className="text-xs text-gray-500 text-center space-y-1">
                <p>Default payment method: Cash</p>
                <p>You can change payment method during checkout</p>
              </div>
            </div>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}

export default CartSheet;
