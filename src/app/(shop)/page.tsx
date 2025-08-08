import React from "react";
import ShopComponent from "./Shop";
import { prisma } from "@/lib/prisma";
import NoResult from "@/components/NoResult";
import { Product } from "@prisma/client";
async function Home() {
  const [categories, products] = await Promise.all([
    prisma.category.findMany({
      orderBy: { createdAt: "desc" },
    }),
    prisma.product.findMany({
      include: { category: true },
      orderBy: { createdAt: "desc" },
      where: { status: true },
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
  return (
    <div>
      <ShopComponent categories={categories} products={formattedProduct} />
    </div>
  );
}

export default Home;
