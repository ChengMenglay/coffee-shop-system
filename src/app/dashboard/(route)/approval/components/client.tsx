"use client";

import Header from "@/components/Header";
import { DataTable } from "@/components/ui/data-table";
import { Separator } from "@/components/ui/separator";
import {
  PurchaseColumns,
  PurchaseColumn,
  StockUsageColumn,
  StockUsageColumns,
} from "./columns";
import { useMemo, useState } from "react";
import { TabsList, Tabs, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";

type ApprovalColumnProps = {
  purchaseData: PurchaseColumn[];
  stockUsageData: StockUsageColumn[];
};
function ApprovalClient({ purchaseData, stockUsageData }: ApprovalColumnProps) {
  const [requester, setRequester] = useState("");
  const [selectedTabHeader, setSelectedTabHeader] = useState("purchase");
  const [selectTable, setSelectTable] = useState("all");
  const filteredData = useMemo(() => {
    const data =
      selectedTabHeader === "purchase" ? purchaseData : stockUsageData;
    return data.filter((item) => {
      const statusMatch =
        selectTable === "all" ||
        item.approvalStatus ===
          (selectTable === "approved"
            ? "Approved"
            : selectTable === "rejected"
            ? "Rejected"
            : "");
      const requesterMatch = !requester || item.requestedBy === requester;

      return statusMatch && requesterMatch;
    });
  }, [
    selectedTabHeader,
    selectTable,
    purchaseData,
    stockUsageData,
    setRequester,
    requester,
  ]);

  const requesters = useMemo(() => {
    const data =
      selectedTabHeader === "purchase" ? purchaseData : stockUsageData;
    return Array.from(new Set(data.map((item) => item.requestedBy)));
  }, [purchaseData, selectedTabHeader, stockUsageData]);
  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2">
        <Header
          title="My Approvals"
          subtitle="Manage approvals for your store."
        />
      </div>
      <div className="flex justify-between items-center">
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
        <div className="flex items-center gap-2">
          <Button
            variant={"outline"}
            size={"icon"}
            onClick={() => {
              setSelectTable("all");
              setRequester("");
            }}
          >
            <RefreshCcw />
          </Button>
          <Select value={requester} onValueChange={setRequester}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by Requester" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {requesters.map((name) => (
                  <SelectItem key={name} value={name}>
                    {name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

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
