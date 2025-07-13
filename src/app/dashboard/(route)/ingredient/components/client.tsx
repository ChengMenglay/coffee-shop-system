"use client";

import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { columns, IngredientColumn } from "./columns";
import { RefreshCcw } from "lucide-react";

type IngredientColumnProps = {
  data: IngredientColumn[];
};
function IngredientClient({ data }: IngredientColumnProps) {
  const router = useRouter();
  const [filterdData, setFilterdData] = useState<IngredientColumn[]>(data);
  const handleLowStock = () => {
    setFilterdData(data.filter((item) => item.stock <= item.lowStockThreshold));
  };
    useEffect(() => {
      setFilterdData(data);
    }, [data]);
  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2">
        <Header
          title="Ingredient"
          subtitle="Manage ingredient for your store."
          total={data.length}
        />
        <div className="flex items-center gap-2">
          <Button variant={"outline"} onClick={() => setFilterdData(data)}>
            <RefreshCcw />
          </Button>
          <Button variant={"destructive"} onClick={handleLowStock}>
            Low Stock
          </Button>
          <Button onClick={() => router.push("/dashboard/ingredient/new")}>
            New
          </Button>
        </div>
      </div>
      <Separator className="my-6" />
      <DataTable searchKey="name" columns={columns} data={filterdData} />
    </>
  );
}

export default IngredientClient;
