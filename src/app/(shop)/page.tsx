import React from "react";
import ShopComponent from "./Shop";
import { prisma } from "@/lib/prisma";
import NoResult from "@/components/NoResult";
import { Product } from "@prisma/client";
import PromotionDisplay from "../dashboard/(route)/order/components/PromotionDisplay";
async function Home() {
  const [categories, products, promotions] = await Promise.all([
    prisma.category.findMany({
      orderBy: { createdAt: "desc" },
    }),
    prisma.product.findMany({
      include: { category: true },
      orderBy: { createdAt: "desc" },
      where: { status: true },
    }),
    prisma.promotion.findMany({
      where: {
        isActive: true,
        endDate: {
          gte: new Date(),
        },
      },
    }),
  ]);
  const formattedProduct = products.map((product: Product) => ({
    ...product,
    price: product.price.toNumber(),
  }));
  if (categories.length === 0 || formattedProduct.length === 0) {
    return (
      <div>
        <NoResult
          title="No products available."
          description="Please check back later."
        />
      </div>
    );
  }
  const formattedPromotions = promotions?.map((promotion) => ({
    ...promotion,
    discount: promotion.discount ? promotion?.discount.toNumber() : 0,
  }));
  return (
    <div>
      <PromotionDisplay promotions={formattedPromotions} />
      <ShopComponent categories={categories} products={formattedProduct} />
    </div>
  );
}

export default Home;
