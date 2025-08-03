import React from "react";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { SizeColumn } from "./components/columns";
import { formatterUSD } from "@/lib/utils";
import SizeClient from "./components/client";
import { checkPermission } from "@/lib/check-permission";
async function SizePage() {
  await checkPermission(["view:size"]);
  const sizes = await prisma.size.findMany({
    include: { product: true },
    orderBy: { createdAt: "desc" },
  });

  const formattedSize: SizeColumn[] = sizes.map((item) => ({
    id: item.id,
    sizeName: item.sizeName,
    product:
      item.product.name +
      `(${formatterUSD.format(Number(item.product.price))})`,
    priceModifier: formatterUSD.format(Number(item.priceModifier)),
    fullPrice: formatterUSD.format(Number(item.fullPrice)),
    createdAt: format(item.createdAt, "dd MMMM yyyy"),
  }));
  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 px-6 py-8">
        <SizeClient data={formattedSize} />
      </div>
    </div>
  );
}

export default SizePage;
