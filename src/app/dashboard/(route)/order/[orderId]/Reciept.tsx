"use client";
import React, { useRef } from "react";
import { OrderItem } from "types";
import { useReactToPrint } from "react-to-print";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ArrowLeft, Printer } from "lucide-react";

interface OrderInvoiceProps {
  orderItems: OrderItem[];
}

const OrderInvoice: React.FC<OrderInvoiceProps> = ({ orderItems }) => {
  if (!orderItems || orderItems.length === 0) {
    return <div className="p-4">No order items found</div>;
  }

  // Get order info from first item (all items belong to same order)
  const order = orderItems[0].order;
  const orderDate = new Date(order.createdAt);
  const formattedDate = format(orderDate, "MM/dd/yyyy");
  const formattedTime = format(orderDate, "hh:mm:ss a");
  const router = useRouter();
  const contentRef = useRef<HTMLDivElement>(null);
  const reactToPrintFn = useReactToPrint({
    contentRef,
    documentTitle: `Receipt-${order.displayId}`,
  });

  // Calculate totals
  const subtotal = orderItems.reduce((sum, item) => {
    return sum + Number(item.price) * item.quantity;
  }, 0);

  const orderDiscount = Number(order.discount) || 0;
  const finalTotal = Number(order.total);

  // Helper function to format currency
  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  return (
    <div className="max-w-sm mx-auto bg-white relative min-h-screen">
      {/* Navigation - No Print */}
      <div className="no-print absolute top-2 left-2 z-10">
        <Button size={"icon"} variant={"outline"} onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
      </div>

      {/* Receipt Content */}
      <div
        ref={contentRef}
        className="receipt-content bg-white p-4 max-w-[80mm] mx-auto"
        style={{ fontSize: "12px", lineHeight: "1.3" }}
      >
        {/* Header */}
        <div className="text-center border-b-2 border-dashed border-gray-400 pb-3 mb-4">
          <h1 className="text-lg font-bold mb-1">COFFEE SHOP</h1>
          <p className="text-xs">Fresh Coffee • Delicious Treats</p>
          <p className="text-xs mt-1">123 Coffee Street, Phnom Penh</p>
          <p className="text-xs">Phone: (855) 89-240-766</p>
          <p className="text-xs">Email: info@coffeeshop.kh</p>
        </div>

        {/* Order Info */}
        <div className="mb-4 text-xs space-y-1">
          <div className="flex justify-between">
            <span className="font-medium">Order ID:</span>
            <span className="font-mono">{"# " + order.displayId}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Date:</span>
            <span>{formattedDate}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Time:</span>
            <span>{formattedTime}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Status:</span>
            <span className="font-medium text-green-600">
              {order.orderStatus}
            </span>
          </div>
        </div>

        {/* Customer Info */}
        <div className="mb-4 text-xs border-b border-dashed border-gray-400 pb-3">
          <h3 className="font-bold mb-2">CUSTOMER DETAILS</h3>
          <div className="flex justify-between">
            <span>Cashier:</span>
            <span>{order.user.name}</span>
          </div>
          {order.user.phone && (
            <div className="flex justify-between">
              <span>Phone:</span>
              <span>{order.user.phone}</span>
            </div>
          )}
          <div className="flex justify-between mt-2">
            <span>Payment:</span>
            <span
              className={`font-medium ${
                order.paymentStatus ? "text-green-600" : "text-red-600"
              }`}
            >
              {order.paymentStatus ? "PAID" : "UNPAID"}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Method:</span>
            <span>{order.paymentMethod}</span>
          </div>
        </div>

        {/* Order Items */}
        <div className="mb-4">
          <h3 className="text-sm font-bold mb-3 text-center border-b border-dashed border-gray-400 pb-1">
            ORDER ITEMS
          </h3>

          {orderItems.map((item, index) => {
            const itemTotal = Number(item.price) * item.quantity;
            const basePrice = Number(item.productId.price);
            const hasProductDiscount =
              item.productId.discount && Number(item.productId.discount) > 0;

            return (
              <div
                key={item.id}
                className={`mb-3 ${
                  index > 0 ? "border-t border-dotted border-gray-300 pt-2" : ""
                }`}
              >
                {/* Item Name and Basic Info */}
                <div className="flex justify-between items-start mb-1">
                  <div className="flex-1 mr-2">
                    <div className="font-medium text-sm">
                      {item.productId.name}
                    </div>
                    <div className="text-xs text-gray-600">
                      Qty: {item.quantity} ×{" "}
                      {formatCurrency(Number(item.price))}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {formatCurrency(itemTotal)}
                    </div>
                    {hasProductDiscount && (
                      <div className="text-xs line-through text-gray-500">
                        {formatCurrency(basePrice * item.quantity)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Item Customizations */}
                <div className="text-xs text-gray-600 ml-2 space-y-0.5">
                  {/* Size */}
                  {item.sizeId && item.size && (
                    <div className="flex justify-between">
                      <span>• Size:</span>
                      <span>{item.size.sizeName}</span>
                    </div>
                  )}

                  {/* Sugar */}
                  {item.sugar && (
                    <div className="flex justify-between">
                      <span>• Sugar:</span>
                      <span>{item.sugar}</span>
                    </div>
                  )}

                  {/* Ice */}
                  {item.ice && (
                    <div className="flex justify-between">
                      <span>• Ice:</span>
                      <span>{item.ice}</span>
                    </div>
                  )}

                  {/* Extra Shot */}
                  {item.extraShotId && item.extraShot && (
                    <div className="flex justify-between">
                      <span>• Extra Shot:</span>
                      <span>{item.extraShot.name}</span>
                    </div>
                  )}

                  {/* Product Discount */}
                  {hasProductDiscount && (
                    <div className="text-green-600 font-medium">
                      • Product Discount: -{item.productId.discount}% OFF
                    </div>
                  )}

                  {/* Note */}
                  {item.note && (
                    <div className="italic text-blue-600">
                      • Note: {item.note}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Note */}
        {order.note && (
          <div className="mb-4 text-xs border border-blue-200 bg-blue-50 p-2 rounded">
            <div className="font-medium text-blue-800">Order Note:</div>
            <div className="text-blue-700 italic">{order.note}</div>
          </div>
        )}

        {/* Totals */}
        <div className="border-t-2 border-dashed border-gray-400 pt-3 mb-4">
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>

            {orderDiscount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Order Discount:</span>
                <span>-{formatCurrency(orderDiscount)}</span>
              </div>
            )}

            <div className="border-t border-solid border-gray-400 pt-2 mt-2">
              <div className="flex justify-between text-base font-bold">
                <span>TOTAL:</span>
                <span>{formatCurrency(finalTotal)}</span>
              </div>

              {/* Riel equivalent */}
              <div className="flex justify-between text-xs text-gray-600 mt-1">
                <span>In Riel:</span>
                <span>៛{(finalTotal * 4100).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center border-t border-dashed border-gray-400 pt-3">
          <p className="text-sm font-bold mb-2">THANK YOU FOR YOUR ORDER!</p>
          <p className="text-xs text-gray-600 mb-1">
            Please keep this receipt for your records
          </p>
          <p className="text-xs text-gray-500 mb-2">Visit us again soon!</p>
          <p className="text-xs text-gray-400">
            Printed: {format(new Date(), "MM/dd/yyyy hh:mm:ss a")}
          </p>
        </div>
      </div>

      {/* Action Buttons - No Print */}
      <div className="no-print mb-4 text-center my-6 flex justify-between gap-3 px-4">
        <Button
          onClick={() => router.push("/dashboard/order")}
          variant="outline"
          className="flex-1"
        >
          Back To Sales
        </Button>
        <Button
          onClick={reactToPrintFn}
          className="flex-1 flex items-center justify-center gap-2"
        >
          <Printer className="w-4 h-4" />
          Print Receipt
        </Button>
      </div>

      {/* Enhanced Print Styles */}
      <style>{`
        @media print {
          @page {
            size: 80mm auto;
            margin: 2mm;
          }
          
          .no-print {
            display: none !important;
          }
          
          .receipt-content {
            width: 76mm !important;
            max-width: 76mm !important;
            margin: 0 !important;
            padding: 2mm !important;
            font-size: 10px !important;
            line-height: 1.2 !important;
            color: #000 !important;
            background: white !important;
          }
          
          * {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          
          .text-green-600 {
            color: #16a34a !important;
          }
          
          .text-red-600 {
            color: #dc2626 !important;
          }
          
          .text-blue-600 {
            color: #2563eb !important;
          }
          
          .bg-blue-50 {
            background-color: #eff6ff !important;
          }
          
          .border-blue-200 {
            border-color: #bfdbfe !important;
          }
        }

        @media screen {
          .receipt-content {
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            border: 1px solid #e5e7eb;
          }
        }
      `}</style>
    </div>
  );
};

export default OrderInvoice;
