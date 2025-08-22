"use client";
import React, { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CloseTimeReport from "./CloseTimeReport";
import PaymentValidation from "./components/PaymentValidation";
import InventoryCheck from "./components/InventoryCheck";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock } from "lucide-react";
import axios from "axios";
import {  CheckListdataType } from "types";

function CloseOutDay() {
  const [completedSteps, setCompletedSteps] = useState({
    cashCount: false,
    inventoryCheck: false,
    salesReport: false,
    pendingOrders: false,
    securityCheck: false,
  });

  const [checklistData, setChecklistData] = useState<{
    cashCountData: CheckListdataType["cashCountData"] | null;
    inventoryData: CheckListdataType["inventoryData"] | null;
    salesData: CheckListdataType["salesData"] | null;
    paymentData: CheckListdataType["paymentData"] | null;
  }>({
    cashCountData: null,
    inventoryData: null,
    salesData: null,
    paymentData: null,
  });
  useEffect(() => {
    fetchClosingData();
  }, []);

  const fetchClosingData = async () => {
    try {
      const today = new Date().toISOString().split("T")[0];

      // Get comprehensive validation data
      const validationResponse = await axios.get(
        `/api/closing-validation?date=${today}`
      );

      if (validationResponse.data.isAlreadyClosed) {
        // Day is already closed, mark all steps as complete
        setCompletedSteps({
          cashCount: true,
          inventoryCheck: true,
          salesReport: true,
          pendingOrders: true,
          securityCheck: true,
        });
        return;
      }

      const validation = validationResponse.data.validationResults;

      // Update completion status based on validation
      setCompletedSteps((prev) => ({
        ...prev,
        paymentValidation: validation.paymentValidation.completed,
        pendingOrders: validation.pendingOrders.completed,
        salesReport: validation.salesReport.completed,
      }));

      // Fetch additional data
      const [dailyReport, cashCount] = await Promise.all([
        axios.get(`/api/reports/daily?date=${today}`),
        axios.get(`/api/cash-count?date=${today}`),
      ]);

      setChecklistData({
        salesData: dailyReport.data,
        cashCountData: cashCount.data,
        inventoryData: null,
        paymentData: validation.paymentValidation.paymentBreakdown,
      });
    } catch (error) {
      console.error("Error fetching closing data:", error);
    }
  };
  const handleCashCountComplete = (cashData: CheckListdataType["cashCountData"]) => {
    setCompletedSteps((prev) => ({ ...prev, cashCount: true }));
    setChecklistData((prev) => ({ ...prev, cashCountData: cashData }));
    console.log("Cash count completed:", cashData);
  };
  console.log(checklistData);
  const handleInventoryComplete = (inventoryData: CheckListdataType["inventoryData"]) => {
    setCompletedSteps((prev) => ({ ...prev, inventoryCheck: true }));
    setChecklistData((prev) => ({ ...prev, inventoryData }));
    console.log("Inventory check completed:", inventoryData);
  };

  const handlePendingOrdersCheck = async () => {
    try {
      // Check for any pending/draft orders
      const response = await axios.get("/api/orders?status=Draft");
      const hasPendingOrders = response.data && response.data.length > 0;

      if (!hasPendingOrders) {
        setCompletedSteps((prev) => ({ ...prev, pendingOrders: true }));
      }
    } catch (error) {
      console.error("Error checking pending orders:", error);
    }
  };

  const handleSecurityCheck = () => {
    // Manual security checklist completion
    setCompletedSteps((prev) => ({ ...prev, securityCheck: true }));
  };
  const getStepStatus = (step: keyof typeof completedSteps) => {
    if (completedSteps[step]) {
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    }
    return <Clock className="w-4 h-4 text-gray-400" />;
  };

  const getStepBadge = (step: keyof typeof completedSteps) => {
    if (completedSteps[step]) {
      return (
        <Badge variant="default" className="bg-green-600">
          Complete
        </Badge>
      );
    }
    return <Badge variant="secondary">Pending</Badge>;
  };

  const allStepsComplete = Object.values(completedSteps).every(Boolean);

  return (
    <div className="px-6 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">End of Day Closing</h1>
        <p className="text-gray-600">
          Complete all closing procedures before finalizing the day
        </p>

        {/* Progress Overview */}
        <Card className="mt-4 p-4">
          <h2 className="font-semibold mb-3">Closing Progress</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <div className="flex items-center gap-2">
                {getStepStatus("cashCount")}
                <span className="text-sm">Cash Count</span>
              </div>
              {getStepBadge("cashCount")}
            </div>
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <div className="flex items-center gap-2">
                {getStepStatus("inventoryCheck")}
                <span className="text-sm">Inventory</span>
              </div>
              {getStepBadge("inventoryCheck")}
            </div>
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <div className="flex items-center gap-2">
                {getStepStatus("salesReport")}
                <span className="text-sm">Sales Report</span>
              </div>
              {getStepBadge("salesReport")}
            </div>
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <div className="flex items-center gap-2">
                {getStepStatus("pendingOrders")}
                <span className="text-sm">Orders</span>
              </div>
              {getStepBadge("pendingOrders")}
            </div>
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <div className="flex items-center gap-2">
                {getStepStatus("securityCheck")}
                <span className="text-sm">Security</span>
              </div>
              {getStepBadge("securityCheck")}
            </div>
          </div>

          {allStepsComplete && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle className="w-5 h-5" />
                <span className="font-semibold">
                  All closing procedures completed!
                </span>
              </div>
            </div>
          )}
        </Card>
      </div>

      <Tabs defaultValue="checklist" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="checklist" className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Checklist
          </TabsTrigger>
          <TabsTrigger value="cash-count" className="flex items-center gap-2">
            {getStepStatus("cashCount")}
            Cash Count
          </TabsTrigger>
          <TabsTrigger value="inventory" className="flex items-center gap-2">
            {getStepStatus("inventoryCheck")}
            Inventory
          </TabsTrigger>
          <TabsTrigger value="sales-report" className="flex items-center gap-2">
            {getStepStatus("salesReport")}
            Sales Report
          </TabsTrigger>
        </TabsList>

        <TabsContent value="checklist" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Closing Checklist</h3>
            <div className="space-y-4">
              {/* Cash Count */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStepStatus("cashCount")}
                  <div>
                    <h4 className="font-medium">Cash Count</h4>
                    <p className="text-sm text-gray-600">
                      Count physical cash and reconcile with system
                    </p>
                  </div>
                </div>
                {getStepBadge("cashCount")}
              </div>

              {/* Inventory Check */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStepStatus("inventoryCheck")}
                  <div>
                    <h4 className="font-medium">Inventory Check</h4>
                    <p className="text-sm text-gray-600">
                      Verify stock levels and identify low stock items
                    </p>
                  </div>
                </div>
                {getStepBadge("inventoryCheck")}
              </div>

              {/* Pending Orders */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStepStatus("pendingOrders")}
                  <div>
                    <h4 className="font-medium">Pending Orders</h4>
                    <p className="text-sm text-gray-600">
                      Ensure all orders are completed or cancelled
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePendingOrdersCheck}
                    className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                  >
                    Check Now
                  </button>
                  {getStepBadge("pendingOrders")}
                </div>
              </div>

              {/* Sales Report */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStepStatus("salesReport")}
                  <div>
                    <h4 className="font-medium">Sales Report</h4>
                    <p className="text-sm text-gray-600">
                      Generate and review daily sales report
                    </p>
                  </div>
                </div>
                {getStepBadge("salesReport")}
              </div>

              {/* Security Check */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStepStatus("securityCheck")}
                  <div>
                    <h4 className="font-medium">Security & Cleanup</h4>
                    <p className="text-sm text-gray-600">
                      Clean equipment, secure premises, lock up
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSecurityCheck}
                    className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                  >
                    Mark Complete
                  </button>
                  {getStepBadge("securityCheck")}
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="cash-count" className="space-y-4">
          <PaymentValidation onCashCountComplete={handleCashCountComplete} />
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4">
          <InventoryCheck onInventoryComplete={handleInventoryComplete} />
        </TabsContent>

        <TabsContent value="sales-report" className="space-y-4">
          <CloseTimeReport
            onCloseDay={() => {
              setCompletedSteps((prev) => ({ ...prev, salesReport: true }));
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default CloseOutDay;
