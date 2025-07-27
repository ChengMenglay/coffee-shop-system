import React from "react";
import { prisma } from "@/lib/prisma";
import { checkPermission } from "@/lib/check-permission";
import SizeForm from "./SizeForm";

async function IngredientPage({ params }: { params: { sizeId: string } }) {
  const { sizeId } = await params;
  const [size, products] = await Promise.all([
    prisma.size.findUnique({
      where: { id: sizeId },
    }),
    prisma.product.findMany({ orderBy: { createdAt: "desc" } }),
  ]);
  if (size === null) {
    await checkPermission(["create:size"]);
  } else {
    await checkPermission(["edit:size"]);
  }
  const formattedSize = size
    ? {
        ...size,
        priceModifier: size.priceModifier.toNumber(),
        fullPrice: size.fullPrice.toNumber(),
      }
    : null;
  const formattedProduct = products
    ? products.map((item) => ({ ...item, price: item.price.toNumber() }))
    : null;
  return (
    <div className="flex-col h-full">
      <div className="space-y-4 px-6 py-8">
        <SizeForm products={formattedProduct} initialData={formattedSize} />
      </div>
    </div>
  );
}

export default IngredientPage;
