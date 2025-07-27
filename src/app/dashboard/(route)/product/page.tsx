import React from "react";
import ProductClient from "./components/client";
import { prisma } from "@/lib/prisma";
import { ProductColumn } from "./components/columns";
import { format } from "date-fns";
import { checkPermission } from "@/lib/check-permission";
import { formatterUSD } from "@/lib/utils";
async function CategoryPage() {
  await checkPermission(["view:category"]);
  const products = await prisma.product.findMany({
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });
  const formattedProduct: ProductColumn[] = products.map((item) => ({
    id: item.id,
    name: item.name,
    image: item.image,
    category: item.category.name,
    price: formatterUSD.format(Number(item.price)),
    status: item.status,
    discount: item.discount ? `${item.discount}%` : "",
    createdAt: format(item.createdAt, "dd MMMM yyyy"),
  }));
  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 px-6 py-8">
        <ProductClient data={formattedProduct} />
      </div>
    </div>
  );
}

export default CategoryPage;
