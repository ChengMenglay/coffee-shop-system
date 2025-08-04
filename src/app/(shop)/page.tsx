import React from "react";
import ShopComponent from "./Shop";
import { prisma } from "@/lib/prisma";
import { Product } from "@/generated/prisma";
async function Home() {
  const [categories, products] = await Promise.all([
    prisma.category.findMany({
      orderBy: { createdAt: "desc" },
    }),
    prisma.product.findMany({
      include: { category: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);
  const formattedProduct = products.map((product: Product) => ({
    ...product,
    price: product.price.toNumber(),
  }));
  return (
    <div>
      <ShopComponent categories={categories} products={formattedProduct} />
    </div>
  );
}

export default Home;
