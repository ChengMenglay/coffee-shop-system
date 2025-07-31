"use client";
import React, { useRef } from "react";
import { OrderItem } from "types";
import { useReactToPrint } from "react-to-print";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ArrowLeft } from "lucide-react";

interface OrderInvoiceProps {
  orderItems: OrderItem[];
}

const OrderInvoice: React.FC<OrderInvoiceProps> = ({ orderItems }) => {
  if (!orderItems || orderItems.length === 0) {
    return <div className="p-4">No order items found</div>;
  }

  // Get order info from first item (all items belong to same order)
  const order = orderItems[0].order;
  const now = new Date();
  const currentDate = format(now, "M/dd/yyyy");
  const currentTime = format(now, "h:mm:ss a");
  const router = useRouter();
  const contentRef = useRef<HTMLDivElement>(null);
  const reactToPrintFn = useReactToPrint({ contentRef });

  const subtotal = orderItems.reduce((sum, item) => {
    const itemTotal = item.price * item.quantity;
    return sum + itemTotal;
  }, 0);

  const orderDiscount = order.discount;
  const finalTotal = order.total;

  return (
    <div className="max-w-sm mx-auto bg-white relative">
      <div className="absolute top-2 left-2">
        {" "}
        <Button size={"icon"} variant={"outline"} onClick={() => router.back()}>
          <ArrowLeft />
        </Button>
      </div>

      {/* Receipt Content */}
      <div
        ref={contentRef}
        className="receipt-content bg-white p-4 font-mono text-sm"
      >
        {/* Header */}
        <div className="text-center border-b border-dashed border-gray-400 pb-3 mb-3">
          <h1 className="text-lg font-bold mb-1">COFFEE SHOP</h1>
          <p className="text-xs">Fresh Coffee • Delicious Treats</p>
          <p className="text-xs mt-1">123 Coffee Street, Phnom Penh</p>
          <p className="text-xs">Phone: (855) 89-240-766</p>
        </div>

        {/* Order Info */}
        <div className="mb-3 text-xs">
          <div className="flex justify-between">
            <p>Order ID:</p>
            <p>{order.displayId}</p>
          </div>
          <div className="flex justify-between">
            <p>Date:</p>
            <p>{currentDate}</p>
          </div>
          <div className="flex justify-between">
            <p>Time:</p>
            <p>{currentTime}</p>
          </div>
        </div>

        {/* Customer Info */}
        <div className="mb-3 text-xs border-b border-dashed border-gray-400 pb-3">
          <div className="flex justify-between">
            <p>Customer:</p>
            <p>{order.user.name}</p>
          </div>
          {order.user.phone && (
            <div className="flex justify-between">
              <p>Phone:</p>
              <p>{order.user.phone}</p>
            </div>
          )}
          <div className="flex justify-between">
            <p>Payment:</p>
            <p>{order.paymentStatus ? "PAID" : "UNPAID"}</p>
          </div>
          <div className="flex justify-between">
            <p>Method:</p>
            <p>{order.paymentMethod}</p>
          </div>
        </div>

        {/* Order Items */}
        <div className="mb-3">
          <h3 className="text-sm font-bold mb-2 text-center">ORDER ITEMS</h3>
          <div className="border-b border-dashed border-gray-400 pb-1 mb-2">
            <div className="grid grid-cols-12 gap-1 text-xs font-bold">
              <div className="col-span-5">ITEM</div>
              <div className="col-span-2 text-center">QTY</div>
              <div className="col-span-2 text-right">PRICE</div>
              <div className="col-span-3 text-right">TOTAL</div>
            </div>
          </div>

          {orderItems.map((item) => {
            const itemTotal = item.price * item.quantity;
            const basePrice = item.productId.price;
            const sizePrice = item.size.fullPrice;
            const hasProductDiscount =
              item.productId.discount && item.productId.discount > 0;

            return (
              <div key={item.id} className="mb-3">
                {/* Main item row */}
                <div className="grid grid-cols-12 gap-1 text-xs">
                  <div className="col-span-5">
                    <div className="font-medium truncate">
                      {item.productId.name}
                    </div>
                  </div>
                  <div className="col-span-2 text-center">{item.quantity}</div>
                  <div className="col-span-2 text-right">
                    {hasProductDiscount ? (
                      <div>
                        <div className="line-through text-gray-500">
                          ${sizePrice.toFixed(2)}
                        </div>
                        <div>${item.price.toFixed(2)}</div>
                      </div>
                    ) : (
                      <div>${item.price.toFixed(2)}</div>
                    )}
                  </div>
                  <div className="col-span-3 text-right font-medium">
                    ${itemTotal.toFixed(2)}
                  </div>
                </div>

                {/* Item details */}
                <div className="ml-1 text-xs text-gray-600 mt-1">
                  <div>
                    Size: {item.size.sizeName} | Sugar: {item.sugar}%
                  </div>
                  <div>
                    Base: ${basePrice.toFixed(2)} + Size: $
                    {(sizePrice - basePrice).toFixed(2)}
                  </div>
                  {hasProductDiscount && (
                    <div className="text-green-600">
                      Product Discount: {item.productId.discount}% OFF
                    </div>
                  )}
                  {item.note && <div className="italic">Note: {item.note}</div>}
                </div>
              </div>
            );
          })}
        </div>

        {/* Totals */}
        <div className="border-t border-dashed border-gray-400 pt-2 mb-3">
          <div className="flex justify-between text-xs mb-1">
            <span>Subtotal:</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          {orderDiscount > 0 && (
            <div className="flex justify-between text-xs mb-1 text-green-600">
              <span>Order Discount:</span>
              <span>-${orderDiscount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm font-bold border-t border-solid border-gray-400 pt-1">
            <span>TOTAL:</span>
            <span>${finalTotal.toFixed(2)}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center border-t border-dashed border-gray-400 pt-3">
          <p className="text-xs mb-2 font-bold">THANK YOU FOR YOUR ORDER!</p>
          <p className="text-xs text-gray-600 mb-1">
            Please keep this receipt for your records
          </p>
          <p className="text-xs text-gray-500">
            Generated: {currentDate} {currentTime}
          </p>
        </div>
      </div>
      <div className="no-print mb-4 text-center my-10 flex justify-between">
        <Button
          onClick={() => router.push("/dashboard/order")}
          className="cursor-pointer"
        >
          Back To Sale
        </Button>
        <Button
          variant={"outline"}
          onClick={reactToPrintFn}
          className="cursor-pointer"
        >
          Print Receipt
        </Button>
      </div>
      {/* Print Styles */}
      <style>{`
        @media print {
          @page {
            size: 80mm auto;
            margin: 2mm;
          }

          
        }
      `}</style>
    </div>
  );
};

export default OrderInvoice;
