import React from "react";

import { prisma } from "@/lib/prisma";
import PurchaseForm from "./PurchaseForm";
import { Ingredient, Supplier } from "@/generated/prisma";
import { checkPermission } from "@/lib/check-permission";

type SupplierWithIngredients = Supplier & {
  suppliedIngredients: Ingredient[];
};
async function PurchasePage({ params }: { params: { purchaseId: string } }) {
  const purchase = await prisma.purchase.findUnique({
    where: { id: params.purchaseId },
  });
  const ingredients = await prisma.ingredient.findMany({
    orderBy: { createdAt: "desc" },
  });
  const suppliers: SupplierWithIngredients[] = await prisma.supplier.findMany({
    where: { isActive: true },
    include: { suppliedIngredients: true },
    orderBy: { createdAt: "desc" },
  });
  if(purchase === null) {
    await checkPermission(["create:purchases"]);
  }else{
    await checkPermission(["edit:purchases"]);
  }
  return (
    <div className="flex-col h-full">
      <div className="space-y-4 px-6 py-8">
        <PurchaseForm
          suppliers={suppliers}
          ingredients={ingredients}
          initialData={purchase}
        />
      </div>
    </div>
  );
}

export default PurchasePage;
