import { prisma } from "@/lib/prisma";
import React from "react";
import ProductDetail from "./ProductDetail";

async function ProductDetailPage({
  params,
}: {
  params: { productId: string };
}) {
  const { productId } = await params;
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      category: true,
    },
  });
  const sugars = await prisma.sugar.findMany({
    where: { productId },
  });
  const ices = await prisma.ice.findMany({
    where: { productId },
  });
  const extraShots = await prisma.extraShot.findMany({
    where: { productId },
  });
  const formattedExtraShots = extraShots.map((extraShot) => ({
    ...extraShot,
    id: extraShot.id ?? "",
    priceModifier: extraShot.priceModifier?.toNumber() || 0,
  }));
  const sizes = await prisma.size.findMany({
    where: { productId },
  });
  const formattedSizes = sizes.map((size) => ({
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
        product={formattedProduct}
        sugars={sugars}
        ices={ices}
        extraShots={formattedExtraShots}
      />
    </div>
  );
}

export default ProductDetailPage;
