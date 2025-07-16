import React from "react";
import IngredientStockForm from "./IngredientStockForm";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/app/(auth)/actions/authAction";
import { checkPermission } from "@/lib/check-permission";

async function IngredientStockPage({
  params,
}: {
  params: { stockUsageId: string };
}) {
  const { stockUsageId } = await params;
  const ingredientStock = await prisma.ingredientStock.findUnique({
    where: { id: stockUsageId },
  });
  
  const ingredients = await prisma.ingredient.findMany({
    orderBy: { createdAt: "desc" },
  });
  if (ingredientStock === null) {
    await checkPermission(["create:stock"]);
  } else {
    await checkPermission(["edit:stock"]);
  }
  const userId = await getUserId();
  return (
    <div className="flex-col h-full">
      <div className="space-y-4 px-6 py-8">
        <IngredientStockForm
          ingredients={ingredients}
          initialData={ingredientStock}
          userId={userId as string}
        />
      </div>
    </div>
  );
}

export default IngredientStockPage;
