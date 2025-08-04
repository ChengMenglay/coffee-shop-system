import { prisma } from "@/lib/prisma";
import React from "react";
import ProductDetail from "./ProductDetail";
import { Product } from "types";
import { ExtraShot, Size } from "@/generated/prisma";

async function ProductDetailPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;
  const [product, sugars, ices, extraShots, sizes] = await Promise.all([
    prisma.product.findUnique({
      where: { id: productId },
      include: {
        category: true,
      },
    }),
    prisma.sugar.findMany({
      where: { productId },
    }),
    prisma.ice.findMany({
      where: { productId },
    }),
    prisma.extraShot.findMany({
      where: { productId },
    }),
    prisma.size.findMany({
      where: { productId },
    }),
  ]);
  const formattedExtraShots = extraShots.map((extraShot: ExtraShot) => ({
    ...extraShot,
    id: extraShot.id ?? "",
    priceModifier: extraShot.priceModifier?.toNumber() || 0,
  }));
  const formattedSizes = sizes.map((size: Size) => ({
    ...size,
    id: size.id ?? "",
    priceModifier: size.priceModifier?.toNumber() || 0,
    fullPrice: size.fullPrice?.toNumber() || 0,
  }));
  const formattedProduct = product
    ? {
        ...product,
        id: product.id ?? "",
        price: product.price?.toNumber() || 0,
      }
    : null;
  return (
    <div className="my-6 max-w-6xl mx-auto">
      <ProductDetail
        sizes={formattedSizes}
        product={formattedProduct as Product}
        sugars={sugars}
        ices={ices}
        extraShots={formattedExtraShots}
      />
    </div>
  );
}

export default ProductDetailPage;
