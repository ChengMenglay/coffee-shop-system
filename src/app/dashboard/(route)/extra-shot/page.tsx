import React from "react";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { ExtraShotColumn } from "./components/columns";
import { formatterUSD } from "@/lib/utils";
import ExtraShotClient from "./components/client";
import { checkPermission } from "@/lib/check-permission";
async function ExtraShotPage() {
  await checkPermission(["view:extra-shot"]);
  const extraShots = await prisma.extraShot.findMany({
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

  const formattedExtraShots: ExtraShotColumn[] = extraShots.map((item) => ({
    id: item.id,
    name: item.name,
    product:
      item.product.name +
      `(${formatterUSD.format(Number(item.product.price))})`,
      priceModifier: formatterUSD.format(Number(item.priceModifier)),
    createdAt: format(item.createdAt, "dd MMMM yyyy"),
  }));
  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 px-6 py-8">
        <ExtraShotClient data={formattedExtraShots} />
      </div>
    </div>
  );
}

export default ExtraShotPage;
