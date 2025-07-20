"use client";

import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { columns, ProductColumn } from "./columns";
import { RefreshCcw } from "lucide-react";

type ProductClientProps = {
  data: ProductColumn[];
};
function ProductClient({ data }: ProductClientProps) {
  const router = useRouter();
  const [filterdData, setFilterdData] = useState<ProductColumn[]>(data);
  useEffect(() => {
    setFilterdData(data);
  }, [data]);
  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2">
        <Header
          title="Product"
          subtitle="Manage product for your store."
          total={data.length}
        />
        <div className="flex items-center gap-2">
          <Button variant={"outline"} onClick={() => setFilterdData(data)}>
            <RefreshCcw />
          </Button>
          <Button onClick={() => router.push("/dashboard/product/new")}>
            New
          </Button>
        </div>
      </div>
      <Separator className="my-6" />
      <DataTable searchKey="name" columns={columns} data={filterdData} />
    </>
  );
}

export default ProductClient;
