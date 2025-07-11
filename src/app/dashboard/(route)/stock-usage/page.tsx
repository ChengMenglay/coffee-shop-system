import React from "react";
import IngredientClient from "./components/client";
import { prisma } from "@/lib/prisma";
import { IngredientStockColumn } from "./components/columns";
import { format } from "date-fns";
async function IngredientStock() {
  const ingredientStocks = await prisma.ingredientStock.findMany({
    include: { ingredient: true },
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
      createdAt: format(item.createdAt, "dd MMMM yyyy"),
    }));
  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 px-6 py-8">
        <IngredientClient data={formattedIngredientStock} />
      </div>
    </div>
  );
}

export default IngredientStock;
