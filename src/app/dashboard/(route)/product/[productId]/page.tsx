import React from "react";
import { prisma } from "@/lib/prisma";
import { checkPermission } from "@/lib/check-permission";
import ProductForm from "./ProductForm";

async function CategoryPage({ params }: { params: Promise<{ productId: string }> }) {
  const { productId } = await params;
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id: productId } }),
    prisma.category.findMany({ orderBy: { createdAt: "desc" } }),
  ]);
  if (product === null) {
    await checkPermission(["create:product"]);
  } else {
    await checkPermission(["edit:product"]);
  }
  const formattedProduct = product
    ? {
        ...product,
        price: product.price.toNumber(),
        discount: product?.discount
      }
    : null;
  return (
    <div className="flex-col h-full">
      <div className="space-y-4 px-6 py-8">
        <ProductForm initialData={formattedProduct} categories={categories} />
      </div>
    </div>
  );
}

export default CategoryPage;
