"use client";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import React, { useState } from "react";
import { Category, Product } from "types";
type ShopTypeProps = {
  categories: Category[];
  products: Product[];
};
function ShopComponent({ categories, products }: ShopTypeProps) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  return (
    <div className="my-4 flex flex-col items-center">
      <Tabs
        value={selectedCategory}
        onValueChange={setSelectedCategory}
        className="mt-4"
      >
        <TabsList className="gap-4">
          <TabsTrigger value={"All"}>All</TabsTrigger>
          {categories.map((cat) => (
            <TabsTrigger key={cat.id} value={cat.name}>
              {cat.name}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}

export default ShopComponent;
