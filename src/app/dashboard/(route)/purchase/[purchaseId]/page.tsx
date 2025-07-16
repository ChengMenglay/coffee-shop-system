import React from "react";

import { prisma } from "@/lib/prisma";
import PurchaseForm from "./PurchaseForm";
import { Ingredient, Supplier } from "@/generated/prisma";
import { checkPermission } from "@/lib/check-permission";
import { getUserId } from "@/app/(auth)/actions/authAction";

type SupplierWithIngredients = Supplier & {
  suppliedIngredients: Ingredient[];
};
async function PurchasePage({ params }: { params: { purchaseId: string } }) {
  const [purchase, ingredients, suppliers, userId] = await Promise.all([
    prisma.purchase.findUnique({
      where: { id: params.purchaseId },
    }),
    prisma.ingredient.findMany({
      orderBy: { createdAt: "desc" },
    }),
    prisma.supplier.findMany({
      where: { isActive: true },
      include: { suppliedIngredients: true },
      orderBy: { createdAt: "desc" },
    }),
    getUserId(),
  ]);
  if (purchase === null) {
    await checkPermission(["create:purchases"]);
  } else {
    await checkPermission(["edit:purchases"]);
  }
  return (
    <div className="flex-col h-full">
      <div className="space-y-4 px-6 py-8">
        <PurchaseForm
          suppliers={suppliers}
          ingredients={ingredients}
          initialData={purchase}
          userId={userId}
        />
      </div>
    </div>
  );
}

export default PurchasePage;
