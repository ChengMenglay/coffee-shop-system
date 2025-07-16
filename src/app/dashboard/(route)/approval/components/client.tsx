"use client";

import Header from "@/components/Header";
import { DataTable } from "@/components/ui/data-table";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
import {
  PurchaseColumns,
  PurchaseColumn,
  StockUsageColumn,
  StockUsageColumns,
} from "./columns";
import { useMemo, useState } from "react";
import { TabsList, Tabs, TabsTrigger } from "@/components/ui/tabs";

type ApprovalColumnProps = {
  purchaseData: PurchaseColumn[];
  stockUsageData: StockUsageColumn[];
};
function ApprovalClient({ purchaseData, stockUsageData }: ApprovalColumnProps) {
  const router = useRouter();
  const [selectedTabHeader, setSelectedTabHeader] = useState("purchase");
  const [selectTable, setSelectTable] = useState("all");
  const filteredData = useMemo(() => {
    if (selectedTabHeader === "purchase") {
      if (selectTable === "all") {
        return purchaseData;
      }
      if (selectTable === "approved") {
        return purchaseData.filter(
          (item) => item.approvalStatus === "Approved"
        );
      }
      if (selectTable === "rejected") {
        return purchaseData.filter(
          (item) => item.approvalStatus === "Rejected"
        );
      }
    } else {
      if (selectTable === "all") {
        return stockUsageData;
      }
      if (selectTable === "approved") {
        return stockUsageData.filter(
          (item) => item.approvalStatus === "Approved"
        );
      }
      if (selectTable === "rejected") {
        return stockUsageData.filter(
          (item) => item.approvalStatus === "Rejected"
        );
      }
    }
  }, [selectedTabHeader, selectTable, purchaseData, stockUsageData]);
  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2">
        <Header
          title="My Approvals"
          subtitle="Manage approvals for your store."
        />
      </div>
      <Tabs
        value={selectedTabHeader}
        onValueChange={setSelectedTabHeader}
        className="mt-4"
      >
        <TabsList>
          <TabsTrigger value="purchase">Purchase</TabsTrigger>
          <TabsTrigger value="stock-usage">Stock Usage</TabsTrigger>
        </TabsList>
      </Tabs>
      <Separator className="my-4" />
      <Tabs value={selectTable} onValueChange={setSelectTable} className="mb-4">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>
      </Tabs>
      <Separator className="my-4" />
      {selectedTabHeader === "purchase" ? (
        <DataTable
          data={filteredData as PurchaseColumn[]}
          columns={PurchaseColumns}
        />
      ) : (
        <DataTable
          data={filteredData as StockUsageColumn[]}
          columns={StockUsageColumns}
        />
      )}
    </>
  );
}

export default ApprovalClient;
