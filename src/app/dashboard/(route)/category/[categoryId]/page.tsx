import React from "react";
import CategoryForm from "./CategoryForm";
import { prisma } from "@/lib/prisma";
import { checkPermission } from "@/lib/check-permission";

async function CategoryPage({
  params,
}: {
  params: Promise<{ categoryId: string }>;
}) {
  const { categoryId } = await params;
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
  });
  if (category === null) {
    await checkPermission(["create:category"]);
  } else {
    await checkPermission(["edit:category"]);
  }
  return (
    <div className="flex-col h-full">
      <div className="space-y-4 px-6 py-8">
        <CategoryForm initialData={category} />
      </div>
    </div>
  );
}

export default CategoryPage;
