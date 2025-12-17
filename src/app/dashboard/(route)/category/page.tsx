import React from "react";
import CategoryClient from "./components/client";
import { prisma } from "@/lib/prisma";
import { CategoryColumn } from "./components/columns";
import { format } from "date-fns";
import { checkPermission } from "@/lib/check-permission";
async function CategoryPage() {
  await checkPermission(["view:category"]);
  const cateogries = await prisma.category.findMany({
    orderBy: { createdAt: "desc" },
  });
  const formattedCategory: CategoryColumn[] = cateogries.map((item) => ({
    id: item.id,
    name: item.name,
    image: item.image || "",
    createdAt: format(item.createdAt, "dd MMMM yyyy"),
  }));
  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 px-6 py-8">
        <CategoryClient data={formattedCategory} />
      </div>
    </div>
  );
}

export default CategoryPage;
