"use client";

import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { columns, SugarColumn } from "./columns";
import { RefreshCcw } from "lucide-react";

type SugarColumnProps = {
  data: SugarColumn[];
};
function SugarClient({ data }: SugarColumnProps) {
  const router = useRouter();
  const [filterdData, setFilterdData] = useState<SugarColumn[]>(data);
  useEffect(() => {
    setFilterdData(data);
  }, [data]);
  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2">
        <Header
          title="Sugar"
          subtitle="Manage sugar for your store."
          total={data.length}
        />
        <div className="flex items-center gap-2">
          <Button variant={"outline"} onClick={() => setFilterdData(data)}>
            <RefreshCcw />
          </Button>
          <Button onClick={() => router.push("/dashboard/sugar/new")}>
            New
          </Button>
        </div>
      </div>
      <Separator className="my-6" />
      <DataTable searchKey="name" columns={columns} data={filterdData} />
    </>
  );
}

export default SugarClient;
