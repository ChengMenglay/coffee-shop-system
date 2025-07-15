import React from "react";
import { prisma } from "@/lib/prisma";
import { IngredientStockColumn } from "./components/columns";
import { format } from "date-fns";
import IngredientStockClient from "./components/client";
import { checkPermission } from "@/lib/check-permission";
async function IngredientStock() {
  await checkPermission(["view:stock"]);
  const ingredientStocks = await prisma.ingredientStock.findMany({
    include: { ingredient: true, user: { include: { role: true } } },
    orderBy: { createdAt: "desc" },
  });
  const formattedIngredientStock: IngredientStockColumn[] =
    ingredientStocks.map((item) => ({
      id: item.id,
      ingredient: item.ingredient.name,
      quantity: item.quantity,
      unit: item.ingredient.unit,
      status: item.status,
      note: item.note ? item.note : "",
      name: item.user.name + " (" + item.user.role.name + ")",
      createdAt: format(item.createdAt, "dd MMMM yyyy"),
    }));
  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 px-6 py-8">
        <IngredientStockClient data={formattedIngredientStock} />
      </div>
    </div>
  );
}

export default IngredientStock;
