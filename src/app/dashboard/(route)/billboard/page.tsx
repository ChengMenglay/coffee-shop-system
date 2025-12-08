import React from "react";
import { prisma } from "@/lib/prisma";
import { BillboardColumn } from "./components/columns";
import { format } from "date-fns";
import { checkPermission } from "@/lib/check-permission";
import BillboardClient from "./components/client";
async function BillboardPage() {
  await checkPermission(["view:billboard"]);
  const billboards = await prisma.billboard.findMany({
    orderBy: { createdAt: "desc" },
  });
  const formattedBillboard: BillboardColumn[] = billboards.map((item) => ({
    id: item.id,
    title: item.title,
    link: item.link || "",
    image: item.image,
    isActive: item.isActive,
    createdAt: format(item.createdAt, "dd MMMM yyyy"),
  }));
  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 px-6 py-8">
        <BillboardClient data={formattedBillboard} />
      </div>
    </div>
  );
}

export default BillboardPage;
