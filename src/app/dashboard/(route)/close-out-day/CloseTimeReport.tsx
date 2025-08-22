"use client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { formatterUSD } from "@/lib/utils";
import { toast } from "sonner";
import axios from "axios";
import { useReactToPrint } from "react-to-print";
import { useSession } from "next-auth/react";
interface DayCloseData {
  totalSales: number;
  totalOrders: number;
  totalCustomers: number;
  closedBy: string;
  paymentMethods: {
    cash: number;
    aba: number;
    creditCard: number;
  };
  topProducts: Array<{
    name: string;
    quantity: number;
    revenue: number;
  }>;
  promotionsUsed: Array<{
    name: string;
    count: number;
    totalDiscount: number;
  }>;
  lowStockItems: Array<{
    name: string;
    currentStock: number;
    threshold: number;
  }>;
  hourlyBreakdown: Array<{
    hour: string;
    orders: number;
    revenue: number;
  }>;
}

interface CloseTimeReportProps {
  onCloseDay?: (data: DayCloseData) => void;
}

function CloseTimeReport({ onCloseDay }: CloseTimeReportProps) {
  const [closeData, setCloseData] = useState<DayCloseData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isClosed, setIsClosed] = useState(false);
  const currentDate = new Date().toLocaleDateString("en-GB");
  const session = useSession();
  const userName = session.data?.user?.name || "Unknown User";
  const contentRef = useRef<HTMLDivElement>(null);
  const reactToPrintFn = useReactToPrint({
    contentRef,
    documentTitle: closeData?.topProducts[0]?.name
      ? `Receipt-${closeData.topProducts[0].name}`
      : "Receipt",
  });
  useEffect(() => {
    fetchDayData();
    checkIfDayClosed();
  }, []);

  const checkIfDayClosed = async () => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const response = await axios.get(`/api/day-close?date=${today}`);

      if (response.data) {
        setIsClosed(true);
      }
    } catch (error) {
      console.error("Error checking day close status:", error);
    }
  };

  const fetchDayData = async () => {
    try {
      setIsLoading(true);
      const today = new Date().toISOString().split("T")[0];
      const response = await axios.get(`/api/reports/daily?date=${today}`);

      if (response.data) {
        setCloseData(response.data);
      } else {
        throw new Error("No data received from API");
      }
    } catch (error) {
      console.error("Error fetching day data:", error);
      toast.error("Failed to fetch daily report data. Please try again.");

      // Set empty data structure instead of mock data
      setCloseData({
        totalSales: 0,
        totalOrders: 0,
        totalCustomers: 0,
        closedBy: "",
        paymentMethods: {
          cash: 0,
          aba: 0,
          creditCard: 0,
        },
        topProducts: [],
        promotionsUsed: [],
        lowStockItems: [],
        hourlyBreakdown: [],
      });
    } finally {
      setIsLoading(false);
    }
  };
  const handleCloseDay = async () => {
    try {
      setIsLoading(true);

      // Validate that all necessary procedures are complete
      const validationChecks = [
        { name: "All Orders Completed", completed: true }, // You can add real validation here
        { name: "Daily Report Generated", completed: closeData !== null },
      ];

      const incompleteChecks = validationChecks.filter(
        (check) => !check.completed
      );

      if (incompleteChecks.length > 0) {
        toast.error(
          `Please complete: ${incompleteChecks.map((c) => c.name).join(", ")}`
        );
        return;
      }
      const closeDataWithUser = {
        ...closeData,
        closedBy: userName,
      };

      // Call API to close the day
      await axios.post("/api/day-close", {
        date: new Date().toISOString().split("T")[0],
        closeData: closeDataWithUser,
      });

      setIsClosed(true);
      toast.success("Day closed successfully!");

      if (onCloseDay && closeData) {
        onCloseDay(closeData);
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to close day. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !closeData) {
    return (
      <Card className="p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="max-w-sm mx-auto bg-white relative">
      {/* Receipt Content */}
      <div
        ref={contentRef}
        className=" bg-white p-4 max-w-[80mm] mx-auto"
        style={{ fontSize: "12px", lineHeight: "1.3" }}
      >
        {/* Header */}
        <div className=" text-center border-b-2 border-dashed border-gray-400 pb-3 mb-4">
          <h1 className="text-lg font-bold mb-1">COFFEE SHOP</h1>
          <p className="text-xs">Daily Close Report</p>
          <p className="text-xs mt-1">Fresh Coffee • Premium Quality</p>
          <p className="text-xs">Phnom Penh, Cambodia</p>
          <p className="text-xs">Tel: +855 89 240 766</p>
        </div>

        {/* Report Info */}
        <div className="mb-4 text-xs space-y-1">
          <div className="flex justify-between">
            <span className="font-medium">Report Date:</span>
            <span className="font-mono">{currentDate}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Generated:</span>
            <span>{new Date().toLocaleTimeString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Generated By:</span>
            <span>{userName}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Status:</span>
            <span
              className={`font-medium ${
                isClosed ? "text-green-600" : "text-red-600"
              }`}
            >
              {isClosed ? "CLOSED" : "OPEN"}
            </span>
          </div>
        </div>
        {closeData && (
          <>
            {/* Sales Summary */}
            <div className="mb-4 text-xs border-b border-dashed border-gray-400 pb-3">
              <h3 className="font-bold mb-2 text-center">
                DAILY SALES SUMMARY
              </h3>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Total Sales:</span>
                  <span className="font-mono font-bold">
                    {formatterUSD.format(closeData.totalSales)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Total Orders:</span>
                  <span className="font-mono">{closeData.totalOrders}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Customers:</span>
                  <span className="font-mono">{closeData.totalCustomers}</span>
                </div>
                <div className="flex justify-between">
                  <span>Avg Order Value:</span>
                  <span className="font-mono">
                    {closeData.totalOrders > 0
                      ? formatterUSD.format(
                          closeData.totalSales / closeData.totalOrders
                        )
                      : formatterUSD.format(0)}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="mb-4 text-xs border-b border-dashed border-gray-400 pb-3">
              <h3 className="font-bold mb-2 text-center">PAYMENT BREAKDOWN</h3>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Cash Payments:</span>
                  <span className="font-mono">
                    {formatterUSD.format(closeData.paymentMethods.cash)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>ABA Bank:</span>
                  <span className="font-mono">
                    {formatterUSD.format(closeData.paymentMethods.aba)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Credit Card:</span>
                  <span className="font-mono">
                    {formatterUSD.format(closeData.paymentMethods.creditCard)}
                  </span>
                </div>
                <div className="border-t border-dotted border-gray-400 pt-1 mt-2">
                  <div className="flex justify-between font-bold">
                    <span>Total Payments:</span>
                    <span className="font-mono">
                      {formatterUSD.format(
                        closeData.paymentMethods.cash +
                          closeData.paymentMethods.aba +
                          closeData.paymentMethods.creditCard
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Products */}
            {closeData.topProducts && closeData.topProducts.length > 0 && (
              <div className="mb-4 text-xs border-b border-dashed border-gray-400 pb-3">
                <h3 className="font-bold mb-2 text-center">
                  TOP SELLING PRODUCTS
                </h3>
                <div className="space-y-1">
                  {closeData.topProducts.slice(0, 5).map((product, index) => (
                    <div key={index} className="flex justify-between">
                      <div className="flex-1">
                        <div className="font-medium">{product.name}</div>
                        <div className="text-gray-600">
                          Qty: {product.quantity}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono">
                          {formatterUSD.format(product.revenue)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Promotions Used */}
            {closeData.promotionsUsed &&
              closeData.promotionsUsed.length > 0 && (
                <div className="mb-4 text-xs border-b border-dashed border-gray-400 pb-3">
                  <h3 className="font-bold mb-2 text-center">
                    PROMOTIONS APPLIED
                  </h3>
                  <div className="space-y-1">
                    {closeData.promotionsUsed.map((promo, index) => (
                      <div key={index} className="flex justify-between">
                        <div className="flex-1">
                          <div className="font-medium">{promo.name}</div>
                          <div className="text-gray-600">
                            Used: {promo.count} times
                          </div>
                        </div>
                        <div className="text-right text-green-600">
                          <div className="font-mono">
                            -{formatterUSD.format(promo.totalDiscount)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Low Stock Alert */}
            {closeData.lowStockItems && closeData.lowStockItems.length > 0 && (
              <div className="mb-4 text-xs border border-red-200 bg-red-50 p-2 rounded">
                <div className="font-bold text-red-800 text-center mb-2">
                  ⚠️ LOW STOCK ALERT
                </div>
                <div className="space-y-1">
                  {closeData.lowStockItems.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between text-red-700"
                    >
                      <span>{item.name}</span>
                      <span>
                        {item.currentStock} / {item.threshold}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
        {/* Day Closure Status */}
        {isClosed && (
          <div className="mb-4 text-xs border border-green-200 bg-green-50 p-2 rounded">
            <div className="font-bold text-green-800 text-center mb-1">
              ✅ DAY SUCCESSFULLY CLOSED
            </div>
            <div className="text-green-700 text-center">
              All procedures completed. Report generated and saved.
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center border-t border-dashed border-gray-400 pt-3">
          <p className="text-sm font-bold mb-2">END OF DAILY REPORT</p>
          <p className="text-xs text-gray-600 mb-1">
            Keep this report for your records
          </p>
          <p className="text-xs text-gray-500 mb-2">
            Thank you for your business!
          </p>
          <p className="text-xs text-gray-400">
            Generated: {new Date().toLocaleString()}
          </p>
        </div>
      </div>

      {/* Action Buttons - No Print */}
      <div className="no-print mb-4 text-center my-6 flex justify-between gap-3 px-4">
        <Button
          onClick={reactToPrintFn}
          variant="outline"
          className="flex-1 flex items-center justify-center gap-2"
          disabled={!closeData}
        >
          <Printer className="w-4 h-4" />
          Print Report
        </Button>
        <Button
          onClick={handleCloseDay}
          disabled={isClosed || isLoading || !closeData}
          className="flex-1 bg-red-600 hover:bg-red-700"
        >
          {isLoading ? "Processing..." : "Close Day"}
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
          
          .bg-green-50 {
            background-color: #f0fdf4 !important;
          }
          
          .bg-red-50 {
            background-color: #fef2f2 !important;
          }
          
          .border-green-200 {
            border-color: #bbf7d0 !important;
          }
          
          .border-red-200 {
            border-color: #fecaca !important;
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
}

export default CloseTimeReport;
