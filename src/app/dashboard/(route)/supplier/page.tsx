import React from "react";
import { prisma } from "@/lib/prisma";
import { SupplierColumn } from "./components/columns";
import SupplierClient from "./components/client";
async function SupplierPage() {
  const suppliers = await prisma.supplier.findMany({
    include: { suppliedIngredients: true },
    orderBy: { createdAt: "desc" },
  });
  const formattedSupplier: SupplierColumn[] = suppliers.map((item) => ({
    id: item.id,
    name: item.name,
    contact: item.contact,
    isActive: item.isActive,
    ingredients: item.suppliedIngredients.map((item) => item.name)
  }));
  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 px-6 py-8">
        <SupplierClient data={formattedSupplier} />
      </div>
    </div>
  );
}

export default SupplierPage;
