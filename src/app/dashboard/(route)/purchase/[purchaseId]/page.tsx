import React from "react";

import { prisma } from "@/lib/prisma";
import PurchaseForm from "./PurchaseForm";

async function PurchasePage({ params }: { params: { purchaseId: string } }) {
  const purchase = await prisma.purchase.findUnique({
    where: { id: params.purchaseId },
  });
  const ingredients = await prisma.ingredient.findMany({
    orderBy: { createdAt: "desc" },
  });
  return (
    <div className="flex-col h-full">
      <div className="space-y-4 px-6 py-8">
        <PurchaseForm ingredients={ingredients} initialData={purchase} />
      </div>
    </div>
  );
}

export default PurchasePage;
