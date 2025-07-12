import React from "react";
import { prisma } from "@/lib/prisma";
import SupplierForm from "./SupplierForm";
import { Ingredient, Supplier } from "@/generated/prisma";

async function SupplierPage({ params }: { params: { supplierId: string } }) {
  const supplier = (await prisma.supplier.findUnique({
    include: { suppliedIngredients: true },
    where: { id: params.supplierId },
  })) as (Supplier & { suppliedIngredients: Ingredient[] }) | null;
  const ingredients = await prisma.ingredient.findMany({
    orderBy: { createdAt: "desc" },
  });
  const supplierWithIds = supplier
    ? {
        ...supplier,
        suppliedIngredients: supplier.suppliedIngredients.map((i) => i),
      }
    : null;

  return (
    <div className="flex-col h-full">
      <div className="space-y-4 px-6 py-8">
        <SupplierForm ingredients={ingredients} initialData={supplierWithIds} />
      </div>
    </div>
  );
}

export default SupplierPage;
