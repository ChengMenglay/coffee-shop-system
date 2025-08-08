import React from "react";
import { prisma } from "@/lib/prisma";
import { checkPermission } from "@/lib/check-permission";
import SugarForm from "./SugarForm";
import { Product } from "@prisma/client";

async function SugarPage({ params }: { params: Promise<{ sugarId: string }> }) {
  const { sugarId } = await params;
  const [sugar, products] = await Promise.all([
    prisma.sugar.findUnique({
      where: { id: sugarId },
    }),
    prisma.product.findMany({ orderBy: { createdAt: "desc" } }),
  ]);
  if (sugar === null) {
    await checkPermission(["create:sugar"]);
  } else {
    await checkPermission(["edit:sugar"]);
  }
  const formattedProduct = products
    ? products.map((item: Product) => ({ ...item, price: item.price.toNumber() }))
    : null;
  return (
    <div className="flex-col h-full">
      <div className="space-y-4 px-6 py-8">
        <SugarForm products={formattedProduct} initialData={sugar} />
      </div>
    </div>
  );
}

export default SugarPage;
