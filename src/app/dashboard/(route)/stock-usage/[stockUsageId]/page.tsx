import React from "react";
import IngredientStockForm from "./IngredientStockForm";
import { prisma } from "@/lib/prisma";

async function IngredientStockPage({
  params,
}: {
  params: { stockUsageId: string };
}) {
  const { stockUsageId } =  params;
  const ingredientStock = await prisma.ingredientStock.findUnique({
    where: { id: stockUsageId },
  });
  const ingredients = await prisma.ingredient.findMany({
    orderBy: { createdAt: "desc" },
  });
  return (
    <div className="flex-col h-full">
      <div className="space-y-4 px-6 py-8">
        <IngredientStockForm
          ingredients={ingredients}
          initialData={ingredientStock}
        />
      </div>
    </div>
  );
}

export default IngredientStockPage;
