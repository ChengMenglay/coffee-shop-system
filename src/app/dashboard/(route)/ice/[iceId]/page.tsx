import React from "react";
import { prisma } from "@/lib/prisma";
import { checkPermission } from "@/lib/check-permission";
import IceForm from "./IceForm";
import { Product } from "@prisma/client";

async function IcePage({ params }: { params: Promise<{ iceId: string }> }) {
  const { iceId } = await params;
  const [ice, products] = await Promise.all([
    prisma.ice.findUnique({
      where: { id: iceId },
    }),
    prisma.product.findMany({ orderBy: { createdAt: "desc" } }),
  ]);
  if (ice === null) {
    await checkPermission(["create:ice"]);
  } else {
    await checkPermission(["edit:ice"]);
  }
  const formattedProduct = products
    ? products.map((item: Product) => ({
        ...item,
        price: item.price.toNumber(),
      }))
    : null;
  return (
    <div className="flex-col h-full">
      <div className="space-y-4 px-6 py-8">
        <IceForm products={formattedProduct} initialData={ice} />
      </div>
    </div>
  );
}

export default IcePage;
