import React from "react";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { SugarColumn } from "./components/columns";
import { formatterUSD } from "@/lib/utils";
import SugarClient from "./components/client";
import { checkPermission } from "@/lib/check-permission";
async function SugarPage() {
  await checkPermission(["view:sugar"]);
  const sugar = await prisma.sugar.findMany({
    include: {
      product: {
        select: {
          name: true,
          price: true,
        },
      },
    },
    where: {},
    orderBy: { createdAt: "desc" },
  });

  const formattedSugar: SugarColumn[] = sugar.map((item) => ({
    id: item.id,
    name: item.name,
    product:
      item.product.name +
      `(${formatterUSD.format(Number(item.product.price))})`,
    createdAt: format(item.createdAt, "dd MMMM yyyy"),
  }));
  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 px-6 py-8">
        <SugarClient data={formattedSugar} />
      </div>
    </div>
  );
}

export default SugarPage;
