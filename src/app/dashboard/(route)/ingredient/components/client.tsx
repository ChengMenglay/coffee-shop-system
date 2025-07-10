"use client";

import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
import React from "react";
import { columns } from "./columns";

function IngredientClient() {
  const router = useRouter();
  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2">
        <Header
          title="Ingredient"
          subtitle="Manage ingredient for your store."
        />
        <div className="flex items-center gap-2">
          <Button variant={"destructive"}>Low Stock</Button>
          <Button onClick={() => router.push("/dashboard/ingredient/new")}>
            New
          </Button>
        </div>
      </div>
      <Separator />
      <DataTable
        searchKey="name"
        columns={columns}
        data={[
          {
            id: "1",
            name: "milk",
            stock: 10,
            unit: "ml",
            lowStockThreshold: 10,
          },
        ]}
      />
    </>
  );
}

export default IngredientClient;
