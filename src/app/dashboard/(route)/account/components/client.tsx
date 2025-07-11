"use client";
import React, { FC, useState, useMemo } from "react";
import { OrderColumn, columns } from "./columns";
import { Separator } from "@radix-ui/react-separator";
import { DataTable } from "@/components/ui/data-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import CellAction from "./cell-action";

interface OrderClientProps {
  data: OrderColumn[];
}

export const ClientOrder: FC<OrderClientProps> = ({ data }) => {
  const [selectedTab, setSelectedTab] = useState("All");

  // Memoize columns to avoid unnecessary re-creations on tab change
  const columnsWithActions = useMemo(() => {
    const dynamicColumns = [...columns];

    if (selectedTab === "Completed") {
      dynamicColumns.push({
        accessorKey: "actions",
        cell: ({ row }) => (
          <CellAction
            data={row.original}
            status1="Pending"
            status2="Canceled"
          />
        ),
      });
    }
    if (selectedTab === "Pending") {
      dynamicColumns.push({
        accessorKey: "actions",
        cell: ({ row }) => (
          <CellAction
            data={row.original}
            status1="Completed"
            status2="Canceled"
          />
        ),
      });
    }
    if (selectedTab === "Canceled") {
      dynamicColumns.push({
        accessorKey: "actions",
        cell: ({ row }) => (
          <CellAction
            data={row.original}
            status1="Completed"
            status2="Pending"
          />
        ),
      });
    }

    return dynamicColumns;
  }, [selectedTab]);

  // Filter orders based on the selected tab
  const filterOrders = useMemo(() => {
    return data.filter((order) => {
      if (selectedTab === "All") return order;
      return order.status === selectedTab;
    });
  }, [data, selectedTab]);

  return (
    <>
      <Separator />
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2">
        <Header
          title="Orders"
          total={filterOrders.length}
          subtitle="Manage orders for your store."
        />
      </div>
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="All">All</TabsTrigger>
          <TabsTrigger value="Completed">Completed</TabsTrigger>
          <TabsTrigger value="Pending">Pending</TabsTrigger>
          <TabsTrigger value="Canceled">Canceled</TabsTrigger>
        </TabsList>
        <TabsContent value="All">
          <DataTable
            searchKey="phone"
            columns={columnsWithActions}
            data={filterOrders}
          />
        </TabsContent>
        <TabsContent value="Completed">
          <DataTable
            searchKey="phone"
            columns={columnsWithActions}
            data={filterOrders}
          />
        </TabsContent>
        <TabsContent value="Pending">
          <DataTable
            searchKey="phone"
            columns={columnsWithActions}
            data={filterOrders}
          />
        </TabsContent>
        <TabsContent value="Canceled">
          <DataTable
            searchKey="phone"
            columns={columnsWithActions}
            data={filterOrders}
          />
        </TabsContent>
      </Tabs>
    </>
  );
};
