import React from "react";
import CategoryForm from "./ProductForm";
import { prisma } from "@/lib/prisma";
import { checkPermission } from "@/lib/check-permission";
import ProductForm from "./ProductForm";

async function CategoryPage({ params }: { params: { productId: string } }) {
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
  return (
    <div className="flex-col h-full">
      <div className="space-y-4 px-6 py-8">
        <ProductForm initialData={product} categories={categories}/>
      </div>
    </div>
  );
}

export default CategoryPage;
