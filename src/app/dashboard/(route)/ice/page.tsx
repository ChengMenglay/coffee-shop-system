import React from "react";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { IceColumn } from "./components/columns";
import { formatterUSD } from "@/lib/utils";
import IceClient from "./components/client";
import { checkPermission } from "@/lib/check-permission";
async function IcePage() {
  await checkPermission(["view:ice"]);
  const ice = await prisma.ice.findMany({
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

  const formattedIce: IceColumn[] = ice.map((item) => ({
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
        <IceClient data={formattedIce} />
      </div>
    </div>
  );
}

export default IcePage;
