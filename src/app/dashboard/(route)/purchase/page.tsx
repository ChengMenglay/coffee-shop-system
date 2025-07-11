import React from "react";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { PurchaseColumn } from "./components/columns";
import { formatterUSD } from "@/lib/utils";
import PurchaseClient from "./components/client";
async function IngredientStock() {
  const purchases = await prisma.purchase.findMany({
    include: { ingredient: true },
    orderBy: { createdAt: "desc" },
  });
  const ingredients = await prisma.ingredient.findMany({
    orderBy: { createdAt: "desc" },
  });
  const formattedPurchases: PurchaseColumn[] = purchases.map((item) => ({
    id: item.id,
    ingredient: item.ingredient.name,
    price: formatterUSD.format(Number(item.price)),
    quantity: item.quantity,
    supplier: item.supplier,
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
