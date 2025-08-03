import React from "react";
import OrderDetail from "./OrderDetail";
import { prisma } from "@/lib/prisma";
import { checkPermission } from "@/lib/check-permission";

export default async function CheckoutPage() {
  await checkPermission(["view:checkout"]);

  const sizes = await prisma.size.findMany({ orderBy: { createdAt: "desc" } });
  const sugars = await prisma.sugar.findMany({
    orderBy: { createdAt: "desc" },
  });

  const formattedSizes = sizes
    ? sizes.map((size) => ({
        ...size,
        priceModifier: size.priceModifier.toNumber(),
        fullPrice: size.fullPrice.toNumber(),
      }))
    : null;

  const formattedSugars = sugars
    ? sugars.map((sugar) => ({
        ...sugar,
      }))
    : null;


  return (
    <div className="p-2 sm:h-screen h-auto">
      <OrderDetail
        sizes={formattedSizes}
        sugars={formattedSugars}
      />
    </div>
  );
}
