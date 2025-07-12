"use client";

import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { columns, SupplierColumn } from "./columns";
import { RefreshCcw } from "lucide-react";

type SupplierColumnProps = {
  data: SupplierColumn[];
};
function SupplierClient({ data }: SupplierColumnProps) {
  const router = useRouter();
  const [filterdData, setFilterdData] = useState<SupplierColumn[]>(data);
  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2">
        <Header
          title="Supplier"
          subtitle="Manage supplier for your store."
          total={data.length}
        />
        <div className="flex items-center gap-2">
          <Button variant={"outline"} onClick={() => setFilterdData(data)}>
            <RefreshCcw />
          </Button>
          <Button onClick={() => router.push("/dashboard/supplier/new")}>
            New
          </Button>
        </div>
      </div>
      <Separator className="my-6" />
      <DataTable searchKey="contact" columns={columns} data={filterdData} />
    </>
  );
}

export default SupplierClient;
