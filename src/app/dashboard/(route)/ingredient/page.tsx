import React from "react";
import IngredientClient from "./components/client";
import { prisma } from "@/lib/prisma";
import { IngredientColumn } from "./components/columns";
import { format } from "date-fns";
import { checkPermission } from "@/lib/check-permission";
async function IngredientPage() {
  await checkPermission(["view:ingredient"]);
  const ingredients = await prisma.ingredient.findMany({
    orderBy: { createdAt: "desc" },
  });
  const formattedIngredient: IngredientColumn[] = ingredients.map((item) => ({
    id: item.id,
    name: item.name,
    stock: item.stock,
    unit: item.unit,
    lowStockThreshold: item.lowStockThreshold,
    createdAt: format(item.createdAt, "dd MMMM yyyy"),
  }));
  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 px-6 py-8">
        <IngredientClient data={formattedIngredient} />
      </div>
    </div>
  );
}

export default IngredientPage;
