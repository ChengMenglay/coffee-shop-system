import React from "react";
import IngredientForm from "./IngredientForm";
import { prisma } from "@/lib/prisma";

async function IngredientPage({
  params,
}: {
  params: { ingredientId: string };
}) {
  const ingredient = await prisma.ingredient.findUnique({
    where: { id: params.ingredientId },
  });
  return (
    <div className="flex-col h-full">
      <div className="space-y-4 px-6 py-8">
        <IngredientForm initialData={ingredient}/>
      </div>
    </div>
  );
}

export default IngredientPage;
