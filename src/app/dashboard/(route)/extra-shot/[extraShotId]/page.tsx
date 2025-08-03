import React from "react";
import { prisma } from "@/lib/prisma";
import { checkPermission } from "@/lib/check-permission";
import ExtraShotForm from "./ExtraShotForm";

async function ExtraShotPage({ params }: { params: { extraShotId: string } }) {
  const { extraShotId } = await params;
  const [extraShot, products] = await Promise.all([
    prisma.extraShot.findUnique({
      where: { id: extraShotId },
    }),
    prisma.product.findMany({ orderBy: { createdAt: "desc" } }),
  ]);
  if (extraShot === null) {
    await checkPermission(["create:extra-shot"]);
  } else {
    await checkPermission(["edit:extra-shot"]);
  }
  const formattedProduct = products
    ? products.map((item) => ({ ...item, price: item.price.toNumber() }))
    : null;
    const formattedExtraShot = extraShot
      ? { ...extraShot, priceModifier: extraShot.priceModifier.toNumber() }
      : null;
  return (
    <div className="flex-col h-full">
      <div className="space-y-4 px-6 py-8">
        <ExtraShotForm products={formattedProduct} initialData={formattedExtraShot} />
      </div>
    </div>
  );
}

export default ExtraShotPage;
