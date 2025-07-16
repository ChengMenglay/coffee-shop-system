import React from "react";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { PurchaseColumn } from "./components/columns";
import { formatterUSD } from "@/lib/utils";
import PurchaseClient from "./components/client";
import { checkPermission } from "@/lib/check-permission";
async function IngredientStock() {
  await checkPermission(["view:purchases"]);
  const [purchases, ingredients] = await Promise.all([
    prisma.purchase.findMany({
      include: { ingredient: true, supplier: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.ingredient.findMany({
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const formattedPurchases: PurchaseColumn[] = purchases.map((item) => ({
    id: item.id,
    ingredient: item.ingredient.name + ` (${item.ingredient.unit})`,
    price: formatterUSD.format(Number(item.price)),
    quantity: ` ${item.quantity} ${item.ingredient.unit}`,
    supplier: item.supplier.name,
    createdAt: format(item.createdAt, "dd MMMM yyyy"),
  }));
  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 px-6 py-8">
        <PurchaseClient ingredients={ingredients} data={formattedPurchases} />
      </div>
    </div>
  );
}

export default IngredientStock;
