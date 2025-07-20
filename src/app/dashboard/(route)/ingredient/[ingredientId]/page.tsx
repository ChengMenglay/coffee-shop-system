import React from "react";
import IngredientForm from "./IngredientForm";
import { prisma } from "@/lib/prisma";
import { checkPermission } from "@/lib/check-permission";

async function IngredientPage({
  params,
}: {
  params: { ingredientId: string };
}) {
  const { ingredientId } = await params;
  const ingredient = await prisma.ingredient.findUnique({
    where: { id: ingredientId },
  });
  if (ingredient === null) {
    await checkPermission(["create:ingredient"]);
  } else {
    await checkPermission(["edit:ingredient"]);
  }
  return (
    <div className="flex-col h-full">
      <div className="space-y-4 px-6 py-8">
        <IngredientForm initialData={ingredient} />
      </div>
    </div>
  );
}

export default IngredientPage;
