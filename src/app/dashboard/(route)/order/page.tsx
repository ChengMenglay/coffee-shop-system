import { prisma } from "@/lib/prisma";
import React from "react";
import Sale from "./components/Sale";
import { checkPermission } from "@/lib/check-permission";

async function SalePage() {
  await checkPermission(["view:order"]);
  const [products, categories, sizes, sugars, ices, extraShots, promotions] =
    await Promise.all([
      prisma.product.findMany({
        where: { status: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.category.findMany({
        orderBy: { createdAt: "desc" },
      }),
      prisma.size.findMany(),
      prisma.sugar.findMany(),
      prisma.ice.findMany(),
      prisma.extraShot.findMany(),
      prisma.promotion.findMany({
        where: {
          isActive: true,
          endDate: {
            gte: new Date(),
          },
        },
      }),
    ]);
  const formattedProducts = products.map((item) => ({
    ...item,
    price: Number(item.price),
  }));
  const formattedSizes = sizes
    ? sizes.map((size) => ({
        ...size,
        priceModifier: size.priceModifier.toNumber(),
        fullPrice: size.fullPrice.toNumber(),
      }))
    : null;
  const formattedExtraShots = extraShots.map((extraShot) => ({
    ...extraShot,
    priceModifier: extraShot.priceModifier.toNumber(),
  }));
  const formattedPromotions = promotions?.map((promotion) => ({
    ...promotion,
    discount: promotion.discount ? promotion?.discount.toNumber() : 0,
  }));
  return (
    <div className=" grid md:grid-cols-12 grid-row-12 gap-2 ">
      <Sale
        products={formattedProducts}
        categories={categories}
        sizes={formattedSizes}
        sugars={sugars}
        ices={ices}
        extraShots={formattedExtraShots}
        promotions={formattedPromotions}
      />
    </div>
  );
}

export default SalePage;
